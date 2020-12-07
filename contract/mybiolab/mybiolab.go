package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type Project struct {
	Pid    string   `json:"pid"`
	Menus  []string `json:"menus"`
	Meals  []string `json:"meals"`
	Status string   `json:"status"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()

	if function == "addProject" {
		return s.addProject(APIstub, args)
	} else if function == "addMenu" {
		return s.addMenu(APIstub, args)
		// } else if function == "addMeal" {
		// 	return s.addMeal(APIstub, args)
	} else if function == "readProject" {
		return s.readProject(APIstub, args)
		// } else if function == "CompleteProject" {
		// 	return s.readProject(APIstub, args)
	} else if function == "readTxHistory" {
		return s.readTxHistory(APIstub, args)
	}
	return shim.Error("Invalid Smart Contract function name.")
}

func (s *SmartContract) addProject(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("fail!")
	}
	var proj = Project{Pid: args[0], Status: "started"}
	projAsBytes, _ := json.Marshal(proj)
	APIstub.PutState(args[0], projAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) addMenu(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
	}
	// getState User
	projAsBytes, err := APIstub.GetState(args[0])
	if err != nil {
		jsonResp := "\"Error\":\"Failed to get state for " + args[0] + "\"}"
		return shim.Error(jsonResp)
	} else if projAsBytes == nil { // no State! error
		jsonResp := "\"Error\":\"Project does not exist: " + args[0] + "\"}"
		return shim.Error(jsonResp)
	}
	// state ok
	project := Project{}
	err = json.Unmarshal(projAsBytes, &project)
	if err != nil {
		return shim.Error(err.Error())
	}
	// 제안 메뉴 추가
	project.Menus = append(project.Menus, args[1])

	// update to User World state
	projAsBytes, err = json.Marshal(project)

	APIstub.PutState(args[0], projAsBytes)

	return shim.Success([]byte("New menu is updated"))
}

func (s *SmartContract) readProject(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	UserAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(UserAsBytes)
}

func (s *SmartContract) readTxHistory(stub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) < 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}
	keyName := args[0]
	// 로그 남기기
	fmt.Println("readTxHistory:" + keyName)

	resultsIterator, err := stub.GetHistoryForKey(keyName)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	// buffer is a JSON array containing historic values for the marble
	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
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
	fmt.Println("readTxHistory returning:\n" + buffer.String() + "\n")

	return shim.Success(buffer.Bytes())
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}
