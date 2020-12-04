/*
 * Copyright IBM Corp All Rights Reserved
 *
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	"github.com/hyperledger/fabric/protos/peer"
)

// SimpleAsset implements a simple chaincode to manage an asset
type SimpleAsset struct {
}
type Data struct { // 필드명은 대문자로 시작
	Id        string  `json:"id"`
	Grade     string  `json:"grade"`
	Places    []Visit `json:"places"`
	LastPlace int     `json:"lastPlace"`
}
type Visit struct {
	Place string `json:"place"`
	State string `json:"state"`
}

// Init is called during chaincode instantiation to initialize any
// data. Note that chaincode upgrade also calls this function to reset
// or to migrate data.
func (t *SimpleAsset) Init(stub shim.ChaincodeStubInterface) peer.Response {

	return shim.Success(nil)
}

// Invoke is called per transaction on the chaincode. Each transaction is
// either a 'get' or a 'set' on the asset created by Init function. The Set
// method may create a new asset by specifying a new key-value pair.
func (t *SimpleAsset) Invoke(stub shim.ChaincodeStubInterface) peer.Response {
	// Extract the function and args from the transaction proposal
	fn, args := stub.GetFunctionAndParameters()

	var result string
	var err error
	if fn == "addVisitor" {
		result, err = addVisitor(stub, args)
	} else if fn == "addPlace" {
		result, err = addPlace(stub, args)
	} else if fn == "queryVisitor" {
		result, err = queryVisitor(stub, args)
	} else if fn == "queryHistoryForKey" {
		result, err = getHistoryForKey(stub, args)
	} else {
		return shim.Error("Not supported chaincode function.")
	}

	if err != nil {
		return shim.Error(err.Error())
	}

	// Return the result as success payload
	return shim.Success([]byte(result))
}

// Set stores the asset (both key and value) on the ledger. If the key exists,
// it will override the value with the new one
func addVisitor(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a parameter")
	}

	// 해당 아이디가 이전에 있는지 검사
	// GetState => return 값이 nil 아니면 중복 아이디

	// JSON  변환
	var data = Data{Id: args[0], Grade: "beginner", LastPlace: 0}
	dataAsBytes, _ := json.Marshal(data)

	err := stub.PutState(args[0], dataAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	return string(dataAsBytes), nil
}

func addPlace(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 2 {
		return "", fmt.Errorf("Incorrect arguments. Expecting 2 parameters")
	}

	// 해당 아이디가 이전에 있는지 검사
	// GetState => return 값이 nil 아니면 중복 아이디
	value, err := stub.GetState(args[0])
	if err != nil {
		return "", fmt.Errorf("Failed to get asset: %s with error: %s", args[0], err)
	}
	if value == nil {
		return "", fmt.Errorf("Asset not found: %s", args[0])
	}
	data := Data{}
	json.Unmarshal(value, &data)

	place := Visit{Place: args[1], State: "registered"}
	data.Places = append(data.Places, place)
	data.LastPlace++

	// JSON  변환
	dataAsBytes, _ := json.Marshal(data)

	err = stub.PutState(args[0], dataAsBytes)
	if err != nil {
		return "", fmt.Errorf("Failed to set asset: %s", args[0])
	}
	return string(dataAsBytes), nil
}

// Get returns the value of the specified asset key
func queryVisitor(stub shim.ChaincodeStubInterface, args []string) (string, error) {
	if len(args) != 1 {
		return "", fmt.Errorf("Incorrect arguments. Expecting a key")
	}

	value, err := stub.GetState(args[0])
	if err != nil {
		return "", fmt.Errorf("Failed to get asset: %s with error: %s", args[0], err)
	}
	if value == nil {
		return "", fmt.Errorf("Asset not found: %s", args[0])
	}
	return string(value), nil
}

func getHistoryForKey(stub shim.ChaincodeStubInterface, args []string) (string, error) {

	if len(args) < 1 {
		return "", fmt.Errorf("Incorrect number of arguments. Expecting 1")
	}
	keyName := args[0]
	// 로그 남기기
	fmt.Println("getHistoryForKey:" + keyName)

	resultsIterator, err := stub.GetHistoryForKey(keyName)
	if err != nil {
		return "", err
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return "", err
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")
		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}

		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	// 로그 남기기
	fmt.Println("getHistoryForKey returning:\n" + buffer.String() + "\n")

	return (string)(buffer.Bytes()), nil
}

// main function starts up the chaincode in the container during instantiate
func main() {
	if err := shim.Start(new(SimpleAsset)); err != nil {
		fmt.Printf("Error starting SimpleAsset chaincode: %s", err)
	}
}
