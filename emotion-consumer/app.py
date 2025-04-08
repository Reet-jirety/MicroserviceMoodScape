# import os
# import sys
# import signal
# import time
# import logging
# import threading
# from queue import Queue, Empty, Full
# from concurrent.futures import ThreadPoolExecutor

# # --- Environment Setup (Keep these!) ---
# os.environ['CUDA_VISIBLE_DEVICES'] = ''
# os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
# # Optional: Control TensorFlow threading for CPU - adjust based on container cores
# # os.environ['TF_NUM_INTEROP_THREADS'] = '1' # Often 1 is good for inference
# # os.environ['TF_NUM_INTRAOP_THREADS'] = str(os.cpu_count() // 2) # Use half the cores? Tune this.

# # --- Late Imports (After env vars are set) ---
# from kafka import KafkaConsumer, KafkaProducer
# from kafka.errors import NoBrokersAvailable
# # Import TF *after* setting env vars
# import tensorflow as tf
# import numpy as np
# import json
# import base64
# import io
# from PIL import Image

# # --- Configuration ---
# KAFKA_BROKERS = ['kafka:9092']
# FACE_DATA_TOPIC = 'faceData'
# EMOTION_RESULT_TOPIC = 'emotionResult'
# CONSUMER_GROUP_ID = 'emotion-group'
# MODEL_PATH = 'model/resnet50v2_best.keras'
# EMOTION_CLASSES = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
# MODEL_INPUT_SIZE = (224, 224)

# # --- Performance Tuning Parameters ---
# # How many messages to process concurrently (adjust based on CPU cores available to the container)
# NUM_WORKER_THREADS = int(os.environ.get('NUM_WORKERS', os.cpu_count() or 4)) # Default to CPU count or 4
# # Max items to hold in the queue before consumption slows down (backpressure)
# MAX_QUEUE_SIZE = NUM_WORKER_THREADS * 5 # Allow some buffer
# # How many images to batch together for prediction
# PREDICTION_BATCH_SIZE = int(os.environ.get('BATCH_SIZE', 8)) # Powers of 2 often good (8, 16, 32)
# # Max time (seconds) to wait before processing a smaller batch
# BATCH_TIMEOUT = 0.05 # 50 milliseconds - process partial batches quickly

# # Kafka Producer settings for batching (reduces network overhead)
# PRODUCER_LINGER_MS = 10 # Wait up to 10ms to batch messages
# PRODUCER_BATCH_SIZE = 64 * 1024 # Batch up to 64KB

# # --- Logging Setup ---
# logging.basicConfig(
#     level=logging.INFO,
#     format='%(asctime)s - %(levelname)s - %(threadName)s - %(message)s',
#     stream=sys.stdout
# )
# logger = logging.getLogger(__name__)

# # --- Global Variables & Shared Resources ---
# consumer = None
# producer = None
# model = None
# shutdown_event = threading.Event() # Use Event for cleaner shutdown signaling
# task_queue = Queue(maxsize=MAX_QUEUE_SIZE) # Queue for (socketId, base64_data)
# # Lock for coordinating batch creation/prediction if needed (may not be necessary with this design)
# # batch_lock = threading.Lock()
# # Shared list for batching (needs careful handling if multiple threads batch)
# # For simplicity, we'll have workers process tasks individually but batch prediction could be added later complexly
# # Or, implement batching within the `process_task` if possible. Let's stick to concurrent single processing first for clarity, then show batching.

# # --- Graceful Shutdown Handler ---
# def handle_shutdown(signum, frame):
#     if not shutdown_event.is_set():
#         logger.info(f"Received signal {signum}. Initiating graceful shutdown...")
#         shutdown_event.set()

# # --- Kafka Client Initialization ---
# # (initialize_kafka function remains largely the same, ensure it sets global vars)
# def initialize_kafka():
#     global consumer, producer
#     retry_delay = 5
#     max_retries = 5
#     retries = 0

#     # Close existing clients if any (e.g., during reconnection)
#     if consumer:
#         try: consumer.close()
#         except Exception: pass
#         consumer = None
#     if producer:
#         try: producer.close()
#         except Exception: pass
#         producer = None

#     while not shutdown_event.is_set() and retries < max_retries:
#         try:
#             logger.info(f"Attempting to connect to Kafka brokers at {KAFKA_BROKERS}...")
#             # --- Consumer ---
#             if consumer is None:
#                 consumer = KafkaConsumer(
#                     FACE_DATA_TOPIC,
#                     bootstrap_servers=KAFKA_BROKERS,
#                     group_id=CONSUMER_GROUP_ID,
#                     auto_offset_reset='earliest',
#                     consumer_timeout_ms=1000, # Timeout to allow checking shutdown_event
#                     value_deserializer=lambda m: json.loads(m.decode('utf-8')),
#                     # Optional: Fetch more messages at once if needed (tune based on message rate)
#                     # max_poll_records=50,
#                     # fetch_max_bytes=52428800, # 50MB
#                 )
#                 logger.info(f"Kafka consumer connected to topic '{FACE_DATA_TOPIC}'.")

#             # --- Producer ---
#             if producer is None:
#                 producer = KafkaProducer(
#                     bootstrap_servers=KAFKA_BROKERS,
#                     value_serializer=lambda m: json.dumps(m).encode('utf-8'),
#                     # Enable batching for performance
#                     linger_ms=PRODUCER_LINGER_MS,
#                     batch_size=PRODUCER_BATCH_SIZE,
#                     # Optional: request acknowledgment (acks='all' for highest durability, acks=1 is default)
#                     # acks=1
#                 )
#                 logger.info(f"Kafka producer connected (linger_ms={PRODUCER_LINGER_MS}, batch_size={PRODUCER_BATCH_SIZE}).")

#             if consumer and producer:
#                 return True # Success

#         except NoBrokersAvailable:
#             retries += 1
#             logger.warning(f"Kafka brokers not available. Retrying in {retry_delay}s... (Attempt {retries}/{max_retries})")
#             if consumer: consumer.close(); consumer = None
#             if producer: producer.close(); producer = None
#             time.sleep(retry_delay)
#         except Exception as e:
#             retries += 1
#             logger.error(f"Error initializing Kafka clients: {e}. Retrying... (Attempt {retries}/{max_retries})")
#             if consumer: consumer.close(); consumer = None
#             if producer: producer.close(); producer = None
#             time.sleep(retry_delay)

#     if not (consumer and producer):
#         logger.error("Failed to connect to Kafka after multiple retries.")
#         return False
#     return False # Should not be reached

# # --- Model Loading ---
# # (load_emotion_model remains the same)
# def load_emotion_model():
#     global model
#     try:
#         logger.info(f"Loading model from: {MODEL_PATH}")
#         model = tf.keras.models.load_model(MODEL_PATH)
#         # Warm up with appropriate batch size if using batch prediction later
#         dummy_batch_size = PREDICTION_BATCH_SIZE if PREDICTION_BATCH_SIZE > 0 else 1
#         dummy_input = np.zeros((dummy_batch_size, *MODEL_INPUT_SIZE, 3), dtype=np.float32)
#         if model:
#             model.predict(dummy_input, verbose=0, batch_size=dummy_batch_size)
#         logger.info(f"Model loaded and warmed up (batch_size={dummy_batch_size}).")
#         return True
#     except Exception as e:
#         logger.error(f"Fatal error loading model: {e}", exc_info=True)
#         return False


# # --- Image Preprocessing (Optimized) ---
# def preprocess_image(base64_img):
#     """Decodes, resizes (RGB), and normalizes the image. Returns NumPy array or None."""
#     try:
#         if ',' in base64_img:
#             base64_img = base64_img.split(',', 1)[1]
#         raw = base64.b64decode(base64_img)
#         # Using Pillow-SIMD if installed can be faster than standard Pillow
#         img = Image.open(io.BytesIO(raw)).convert('RGB')
#         # Use high-quality resize, ANTIALIAS (LANCZOS) is good quality but slow, BILINEAR faster.
#         img = img.resize(MODEL_INPUT_SIZE, Image.Resampling.BILINEAR) # Faster than ANTIALIAS
#         arr = np.array(img, dtype=np.float32) / 255.0 # Convert to float32 directly
#         # No expand_dims here, batching will handle it
#         return arr
#     except Exception as e:
#         # Log specific error during preprocessing
#         logger.debug(f"Error preprocessing image: {e}", exc_info=False) # Debug level maybe
#         return None

# # === BATCH PREDICTION APPROACH ===
# # This requires more coordination between worker threads.
# # We'll implement a slightly simpler concurrent single-prediction approach first,
# # then show how batching could be added conceptually.

# # --- Task Processing Function (for ThreadPoolExecutor) ---
# def process_task(socket_id, face_b64):
#     """Preprocesses, predicts ONE image, and sends result."""
#     # 1. Preprocess
#     preprocessed_image = preprocess_image(face_b64)
#     if preprocessed_image is None:
#         logger.warning(f"Skipping socket {socket_id} due to preprocessing error.")
#         return # Task finished unsuccessfully

#     # Add batch dimension for single prediction
#     tensor = np.expand_dims(preprocessed_image, axis=0)

#     # 2. Predict (Single Image)
#     emo = None
#     try:
#         # Ensure model is accessible (should be loaded globally)
#         if model:
#             preds = model.predict(tensor, verbose=0)
#             idx = int(np.argmax(preds[0])) # Get index from the single prediction result
#             emo = EMOTION_CLASSES[idx]
#         else:
#              logger.error("Model not available for prediction.")
#              return # Cannot proceed

#     except Exception as e:
#         logger.error(f"Error during prediction for socket {socket_id}: {e}", exc_info=False)
#         return # Task finished unsuccessfully

#     # 3. Produce Result
#     if emo and producer:
#         try:
#             result = {'socketId': socket_id, 'emotion': emo}
#             producer.send(EMOTION_RESULT_TOPIC, value=result)
#             # logger.debug(f"Produced result for {socket_id}: {emo}") # Debug maybe
#             # DO NOT flush here - let the producer batch internally
#         except Exception as e:
#             logger.error(f"Failed to send result to Kafka for socket {socket_id}: {e}")
#     elif not emo:
#          logger.warning(f"No emotion detected for socket {socket_id} after prediction.")
#     elif not producer:
#          logger.error("Producer not available, cannot send result.")

# # --- Main Consumer Loop (Feeds the Queue) ---
# def consume_loop(executor):
#     """Consumes messages and puts tasks onto the queue for the executor."""
#     logger.info("Starting Kafka consumer loop...")
#     message_count = 0
#     while not shutdown_event.is_set():
#         try:
#             # Poll for messages with timeout
#             for msg in consumer: # This blocks until message or timeout
#                 if shutdown_event.is_set():
#                     break

#                 message_count += 1
#                 data = msg.value
#                 socketId = data.get('socketId')
#                 face_b64 = data.get('faceData')

#                 if not socketId or not face_b64:
#                     logger.warning(f"Received incomplete message (offset {msg.offset}): {data}")
#                     continue

#                 # Put task onto the queue - this might block if queue is full
#                 try:
#                     task_queue.put((socketId, face_b64), block=True, timeout=1.0)
#                     # logger.debug(f"Queued task for {socketId}")
#                 except Full:
#                     logger.warning("Task queue is full. Consumer may be blocked. Consider increasing workers or queue size if persistent.")
#                     # Option: Drop message or wait longer? Waiting (default block=True) provides backpressure.
#                     # To drop: task_queue.put((socketId, face_b64), block=False)
#                 except Exception as e:
#                      logger.error(f"Error putting task on queue: {e}")


#             # Check shutdown flag again after loop/timeout
#             if shutdown_event.is_set():
#                  break

#         except json.JSONDecodeError as e:
#              logger.warning(f"Could not decode JSON message: {e}")
#         except Exception as e:
#             logger.error(f"Error in Kafka consumer loop: {e}", exc_info=True)
#             # Attempt to reconnect Kafka? Handle based on severity.
#             if "Broker may not be available" in str(e) or "Connection refused" in str(e):
#                 logger.info("Attempting to reconnect Kafka due to consumer error...")
#                 if not initialize_kafka():
#                     logger.error("Reconnection failed. Shutting down.")
#                     shutdown_event.set() # Trigger shutdown
#                     break # Exit consumer loop
#             else:
#                 # For other errors, maybe just log and continue? Or add a delay?
#                 time.sleep(2) # Short delay before retrying poll

#     logger.info(f"Consumer loop exiting. Consumed ~{message_count} messages.")

# # --- Worker Thread Target ---
# def worker_loop():
#     """Pulls tasks from queue and processes them."""
#     processed_count = 0
#     while not shutdown_event.is_set() or not task_queue.empty():
#         try:
#             # Get task from queue, non-blocking with timeout
#             socket_id, face_b64 = task_queue.get(block=True, timeout=0.1) # Small timeout
#             process_task(socket_id, face_b64)
#             task_queue.task_done() # Signal completion
#             processed_count += 1
#         except Empty:
#             # Queue is empty, check if we should shut down
#             if shutdown_event.is_set() and task_queue.empty():
#                  break # Exit loop if shutdown requested and queue empty
#             continue # Otherwise, just loop again
#         except Exception as e:
#              logger.error(f"Unexpected error in worker task processing: {e}", exc_info=True)
#              # Ensure task_done is called even if process_task failed mid-way?
#              # Only if item was successfully retrieved from queue.
#              try:
#                  task_queue.task_done()
#              except ValueError: pass # Already marked done?


#     logger.info(f"Worker thread exiting. Processed ~{processed_count} tasks.")

# # --- Main Execution ---
# if __name__ == '__main__':
#     signal.signal(signal.SIGINT, handle_shutdown)
#     signal.signal(signal.SIGTERM, handle_shutdown)

#     logger.info("--- Starting Optimized Emotion Detection Service ---")
#     logger.info(f"Using {NUM_WORKER_THREADS} worker threads.")
#     logger.info(f"Task queue size: {MAX_QUEUE_SIZE}")
#     # logger.info(f"Prediction batch size: {PREDICTION_BATCH_SIZE}") # Uncomment if using batching

#     # 1. Load Model (Essential)
#     if not load_emotion_model():
#         sys.exit(1)

#     # 2. Initialize Kafka Clients (Essential)
#     if not initialize_kafka():
#         sys.exit(1)

#     # 3. Start Worker Threads using ThreadPoolExecutor
#     #    This is slightly simpler than managing threads manually
#     executor = ThreadPoolExecutor(max_workers=NUM_WORKER_THREADS, thread_name_prefix='Worker')
#     futures = []

#     logger.info("Starting worker threads...")
#     for _ in range(NUM_WORKER_THREADS):
#          # Each worker runs the worker_loop function
#          futures.append(executor.submit(worker_loop))

#     # 4. Start Consumer Loop in the Main Thread (or a dedicated thread)
#     consume_thread = threading.Thread(target=consume_loop, args=(executor,), name="ConsumerThread", daemon=True)
#     consume_thread.start()

#     # --- Wait for Shutdown Signal ---
#     while not shutdown_event.is_set():
#         try:
#             # Keep main thread alive, maybe check worker health periodically
#             time.sleep(1)
#             if not consume_thread.is_alive():
#                 logger.error("Consumer thread died unexpectedly! Initiating shutdown.")
#                 shutdown_event.set()
#                 break
#             # Check if any worker future has raised an exception (optional)
#             # for future in futures:
#             #     if future.done() and future.exception():
#             #         logger.error(f"Worker thread raised exception: {future.exception()}. Shutting down.")
#             #         shutdown_event.set()
#             #         break

#         except KeyboardInterrupt: # Allow Ctrl+C in main thread too
#             handle_shutdown(signal.SIGINT, None)

#     # --- Graceful Shutdown Sequence ---
#     logger.info("Shutdown initiated. Waiting for tasks to complete...")

#     # 1. Stop Consumer Thread (signal it and wait)
#     #    The consumer loop already checks shutdown_event
#     if consume_thread.is_alive():
#         logger.info("Waiting for consumer thread to exit...")
#         consume_thread.join(timeout=10)
#         if consume_thread.is_alive():
#             logger.warning("Consumer thread did not exit cleanly.")

#     # 2. Wait for Queue to be Processed by Workers
#     logger.info(f"Waiting for remaining tasks in queue ({task_queue.qsize()}) to be processed...")
#     # Workers check shutdown_event and queue emptiness, signaled by task_done()
#     task_queue.join() # Blocks until all tasks fetched and marked done
#     logger.info("Task queue empty.")

#     # 3. Shut Down Executor (signals workers and waits)
#     logger.info("Shutting down worker thread pool...")
#     executor.shutdown(wait=True) # Wait for all worker threads to finish
#     logger.info("Worker threads stopped.")

#     # 4. Close Kafka Clients (Final Cleanup)
#     logger.info("Closing Kafka clients...")
#     if consumer:
#         try: consumer.close()
#         except Exception as e: logger.error(f"Error closing consumer: {e}")
#     if producer:
#         try:
#             producer.flush(timeout=10) # Final flush
#             producer.close(timeout=10)
#         except Exception as e: logger.error(f"Error closing producer: {e}")

#     logger.info("--- Emotion Detection Service Stopped ---")
#     sys.exit(0)

import os
import sys
import signal # For graceful shutdown
import time   # For retry delay
import logging # Better than print

# --- Environment Setup (Keep these!) ---
# Explicitly tell TensorFlow not to use GPU (even if it logs errors trying to init CUDA)
os.environ['CUDA_VISIBLE_DEVICES'] = ''
# Suppress TensorFlow informational messages (1: Info, 2: Warnings, 3: Errors)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

# --- Late Imports (After env vars are set) ---
from kafka import KafkaConsumer, KafkaProducer
from kafka.errors import NoBrokersAvailable
import tensorflow as tf
import numpy as np
import json
import base64
import io
from PIL import Image

# --- Configuration ---
KAFKA_BROKERS = ['kafka:9092'] # Use a list
FACE_DATA_TOPIC = 'faceData'
EMOTION_RESULT_TOPIC = 'emotionResult'
CONSUMER_GROUP_ID = 'emotion-group'
MODEL_PATH = 'model/resnet50v2_best.keras' # Ensure this path is correct relative to execution
# Emotion labels (must match your training)
EMOTION_CLASSES = ['Angry', 'Disgust', 'Fear', 'Happy', 'Sad', 'Surprise', 'Neutral']
# Model input size (ensure this matches your ResNetV2 training)
MODEL_INPUT_SIZE = (224, 224)

# --- Logging Setup ---
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(threadName)s - %(message)s',
    stream=sys.stdout
)
logger = logging.getLogger(__name__)

# --- Global Variables ---
consumer = None
producer = None
model = None
shutdown_flag = False # Flag for graceful shutdown

# --- Graceful Shutdown Handler ---
def handle_shutdown(signum, frame):
    global shutdown_flag
    logger.info(f"Received signal {signum}. Initiating graceful shutdown...")
    shutdown_flag = True

# --- Kafka Client Initialization with Retry ---
def initialize_kafka():
    global consumer, producer # Declares intent to modify globals
    retry_delay = 5
    max_retries = 5
    retries = 0

    # Ensure clients are reset if re-initializing after failure
    if consumer: consumer.close(); consumer = None
    if producer: producer.close(); producer = None

    while not shutdown_flag and retries < max_retries:
        try:
            logger.info(f"Attempting to connect to Kafka brokers at {KAFKA_BROKERS}...")
            if consumer is None:
                 consumer = KafkaConsumer(
                    FACE_DATA_TOPIC,
                    bootstrap_servers=KAFKA_BROKERS,
                    group_id=CONSUMER_GROUP_ID,
                    auto_offset_reset='earliest',
                    # Set timeout to allow checking shutdown_flag periodically if not receiving messages
                    consumer_timeout_ms=1000,
                    value_deserializer=lambda m: json.loads(m.decode('utf-8'))
                )
                 logger.info(f"Kafka consumer connected to topic '{FACE_DATA_TOPIC}'.")

            if producer is None:
                producer = KafkaProducer(
                    bootstrap_servers=KAFKA_BROKERS,
                    value_serializer=lambda m: json.dumps(m).encode('utf-8'),
                    # Optional: Add linger_ms and batch_size for higher throughput
                    # linger_ms=5,
                    # batch_size=16384 # 16KB
                )
                logger.info("Kafka producer connected.")

            # If both connected, break the loop
            if consumer and producer:
                 return True

        except NoBrokersAvailable:
            retries += 1
            logger.warning(f"Kafka brokers not available. Retrying in {retry_delay}s... (Attempt {retries}/{max_retries})")
            if consumer: consumer.close(); consumer = None # Clean up partial connections on error
            if producer: producer.close(); producer = None
            time.sleep(retry_delay)
        except Exception as e:
             retries += 1
             logger.error(f"Error initializing Kafka clients: {e}. Retrying in {retry_delay}s... (Attempt {retries}/{max_retries})")
             # Clean up potentially partially initialized clients
             if consumer: consumer.close(); consumer = None
             if producer: producer.close(); producer = None
             time.sleep(retry_delay)

    if not (consumer and producer):
        logger.error("Failed to connect to Kafka after multiple retries. Exiting.")
        return False
    # Should not be reached if loop completed successfully due to return True inside loop
    return False


# --- Model Loading ---
def load_emotion_model():
    global model # Declares intent to modify global
    try:
        logger.info(f"Loading model from: {MODEL_PATH}")
        model = tf.keras.models.load_model(MODEL_PATH)
        # Optional: Warm up the model
        dummy_input = np.zeros((1, *MODEL_INPUT_SIZE, 3), dtype=np.float32) # RGB
        model.predict(dummy_input, verbose=0)
        logger.info("Model loaded and warmed up successfully.")
        return True
    except Exception as e:
        logger.error(f"Fatal error loading model: {e}")
        return False

# --- Image Preprocessing ---
def preprocess_image(base64_img):
    """Decodes, resizes, and normalizes the image."""
    try:
        # Handle potential data URL prefix: "data:image/...;base64,"
        if ',' in base64_img:
            base64_img = base64_img.split(',', 1)[1]

        raw = base64.b64decode(base64_img)
        img = Image.open(io.BytesIO(raw)).convert('RGB') # Ensure RGB for ResNet
        img = img.resize(MODEL_INPUT_SIZE) # Use configured size
        arr = np.array(img) / 255.0 # Normalize to [0, 1]
        return np.expand_dims(arr, axis=0).astype(np.float32) # Ensure float32
    except Exception as e:
        logger.error(f"Error preprocessing image: {e}")
        return None

# --- Emotion Detection ---
def detect_emotion(b64_string):
    """Preprocesses image and predicts emotion."""
    # Reads global model, no assignment, so 'global model' not strictly needed here
    if model is None:
        logger.error("Model not loaded, cannot detect emotion.")
        return None

    tensor = preprocess_image(b64_string)
    if tensor is None:
        return None # Preprocessing failed

    try:
        preds = model.predict(tensor, verbose=0) # verbose=0 suppresses Keras predict logs
        idx = int(np.argmax(preds, axis=1)[0])
        return EMOTION_CLASSES[idx]
    except Exception as e:
        logger.error(f"Error during model prediction: {e}")
        return None

# --- Consumer Loop ---
def consume_messages():
    # *** FIX: Declare intent to use global variables ***
    global shutdown_flag, consumer, producer
    logger.info("Starting Kafka consumer loop...")
    processed_count = 0
    error_count = 0

    # This check now correctly refers to the global consumer
    if not consumer:
        logger.error("Consumer not initialized. Exiting.")
        return

    while not shutdown_flag:
        try:
            # consumer.__iter__() blocks until a message arrives or timeout
            for msg in consumer:
                if shutdown_flag: # Check flag after potentially waking up
                    break

                # Process message
                data = msg.value
                socketId = data.get('socketId')
                face_b64 = data.get('faceData')

                if not socketId or not face_b64:
                    logger.warning(f"Received incomplete message: {data}")
                    error_count += 1
                    continue

                # logger.debug(f"[Kafka] Received faceData for socket {socketId}") # Use debug for high frequency logs
                try:
                    emo = detect_emotion(face_b64)
                    if emo:
                        logger.info(f"[Detect] Socket: {socketId} -> Emotion: {emo}")
                        if producer:
                            producer.send(EMOTION_RESULT_TOPIC, {
                                'socketId': socketId,
                                'emotion': emo
                            })
                            # Consider flushing periodically or on shutdown, not after every message
                            # producer.flush() # Uncomment if low latency is critical, but reduces throughput
                        processed_count += 1
                    else:
                        # Emotion detection failed (preprocessing or prediction error)
                        logger.warning(f"Failed to detect emotion for socket {socketId}")
                        error_count += 1

                except Exception as e:
                    # Catch unexpected errors during detection/sending
                    logger.error(f"Unhandled error processing message for socket {socketId}: {e}", exc_info=True)
                    error_count += 1

            # If loop exits due to timeout (consumer_timeout_ms) and not shutdown, it will just continue
            # logger.debug("Consumer loop iteration finished (timeout or message batch processed).")

        except Exception as e:
            # Catch errors related to the consumer itself (e.g., connection issues after startup)
            logger.error(f"Error in Kafka consumer loop: {e}", exc_info=True)
            # Attempt to re-initialize Kafka connection if it drops
            # These assignments now correctly modify the global variables
            if consumer:
                 try: consumer.close()
                 except Exception: pass # Ignore errors during close
            consumer = None # Set to None BEFORE attempting reconnect
            if producer:
                 try: producer.close()
                 except Exception: pass # Ignore errors during close
            producer = None # Set to None BEFORE attempting reconnect

            logger.info("Attempting to reconnect Kafka...")
            if not initialize_kafka():
                logger.error("Reconnection failed. Shutting down.")
                shutdown_flag = True # Trigger shutdown if reconnection fails


    logger.info(f"Consumer loop finished. Processed: {processed_count}, Errors: {error_count}")

# --- Main Execution ---
if __name__ == '__main__':
    # Register signal handlers
    signal.signal(signal.SIGINT, handle_shutdown)  # Handle Ctrl+C
    signal.signal(signal.SIGTERM, handle_shutdown) # Handle termination signals

    logger.info("--- Starting Emotion Detection Service ---")

    # 1. Load Model
    if not load_emotion_model():
        sys.exit(1) # Exit if model loading fails

    # 2. Initialize Kafka Clients
    if not initialize_kafka():
        sys.exit(1) # Exit if Kafka connection fails

    # 3. Start Consuming
    consume_messages()

    # --- Cleanup on Shutdown ---
    logger.info("Shutting down Kafka clients...")
    if consumer:
        try:
            consumer.close()
            logger.info("Kafka consumer closed.")
        except Exception as e:
            logger.error(f"Error closing consumer: {e}")
    if producer:
        try:
            producer.flush(timeout=10) # Wait max 10s for messages to send
            producer.close(timeout=10)
            logger.info("Kafka producer flushed and closed.")
        except Exception as e:
            logger.error(f"Error flushing/closing producer: {e}")

    logger.info("--- Emotion Detection Service Stopped ---")
    sys.exit(0)