package main

import (
	"encoding/json"
	"fmt"
	"strconv"

	"github.com/hyperledger/fabric/core/chaincode/shim"
	sc "github.com/hyperledger/fabric/protos/peer"
)

type SmartContract struct {
}

type UserRating struct{
	User string `json:"user"`
	Average float64 `json:"average"`
	Rates []Rate `json:"rates"`
}
type Rate struct{
	ProjectTitle string  `json:"projecttitle"`
	Score float64 `json:"score"`
}

func (s *SmartContract) Init(APIstub shim.ChaincodeStubInterface) sc.Response {
	return shim.Success(nil)
}

func (s *SmartContract) Invoke(APIstub shim.ChaincodeStubInterface) sc.Response {

	function, args := APIstub.GetFunctionAndParameters()

	if function == "addUser" {
		return s.addUser(APIstub, args)
	} else if function == "addRating" {
		return s.addRating(APIstub, args)
	} else if function == "readRating" {
		return s.readRating(APIstub, args)
	} 
	return shim.Error("Invalid Smart Contract function name.")
}
 
func (s *SmartContract) addUser(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("fail!")
	}
	var user = UserRating{User: args[0], Average: 0}
	userAsBytes, _ := json.Marshal(user)
	APIstub.PutState(args[0], userAsBytes)

	return shim.Success(nil)
}

func (s *SmartContract) addRating(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3")
	}
	// getState User 
	userAsBytes, err := APIstub.GetState(args[0])
	if err != nil{
		jsonResp := "\"Error\":\"Failed to get state for "+ args[0]+"\"}"
		return shim.Error(jsonResp)
	} else if userAsBytes == nil{ // no State! error
		jsonResp := "\"Error\":\"User does not exist: "+ args[0]+"\"}"
		return shim.Error(jsonResp)
	}
	// state ok
	user := UserRating{}
	err = json.Unmarshal(userAsBytes, &user)
	if err != nil {
		return shim.Error(err.Error())
	}
	// create rate structure
	newRate, _ := strconv.ParseFloat(args[2],64) 
	var Rate = Rate{ProjectTitle: args[1], Score: newRate}

	rateCount := float64(len(user.Rates))

	user.Rates=append(user.Rates,Rate)

	user.Average = (rateCount*user.Average+newRate)/(rateCount+1)
	// update to User World state
	userAsBytes, err = json.Marshal(user);

	APIstub.PutState(args[0], userAsBytes)

	return shim.Success([]byte("rating is updated"))
}

func (s *SmartContract) readRating(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting 1")
	}

	UserAsBytes, _ := APIstub.GetState(args[0])
	return shim.Success(UserAsBytes)
}

func main() {

	// Create a new Smart Contract
	err := shim.Start(new(SmartContract))
	if err != nil {
		fmt.Printf("Error creating new Smart Contract: %s", err)
	}
}