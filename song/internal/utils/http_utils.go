package utils

import (
    "encoding/json"
    "io/ioutil"
    "net/http"
)

func MakeGetRequest(url string) (map[string]interface{}, error) {
    resp, err := http.Get(url)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    body, err := ioutil.ReadAll(resp.Body)
    if err != nil {
        return nil, err
    }

    var data map[string]interface{}
    err = json.Unmarshal(body, &data)
    if err != nil {
        return nil, err
    }

    return data, nil
}
