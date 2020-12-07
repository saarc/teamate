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

type Information struct {
   ID         string `json:"id"`
   AnimalName string `json:"name"`
   AnimalAge  int    `json:"age"`
   AnimalSex  string `json:"sex"`
   CarePerson string `json:"cp"`
   CareHP     string `json:"ch"`
   Address    string `json:"adress"`
   TNR        string `json:"tnr"`
}

/*
AnimalName
AnimalAge
AnimalSex
CarePerson
CareHP
Adress
TNR
*/

func (s *SmartContract) Init(stub shim.ChaincodeStubInterface) sc.Response {
   return shim.Success(nil)
}

func (s *SmartContract) Invoke(stub shim.ChaincodeStubInterface) sc.Response {

   function, args := stub.GetFunctionAndParameters()

   if function == "addPet" {
      return s.addPet(stub, args)
   } else if function == "addPetInfo" {
      return s.addPetInfo(stub, args)
   } else if function == "readPet" {
      return s.readPet(stub, args)
   } else if function == "readTxHistory" {
      return s.readTxHistory(stub, args)
   } else {
      return shim.Error("Invalid Smart Contract function name.")
   }

}

func (s *SmartContract) addPet(stub shim.ChaincodeStubInterface, args []string) sc.Response {

   if len(args) != 1 {
      return shim.Error("fail!")
   }
   //    get state check

   var data = Information{ID: args[0], AnimalName: "", AnimalAge: 0, AnimalSex: "", CarePerson: "", CareHP: "", Address: "", TNR: ""}
   dataAsBytes, _ := json.Marshal(data)

   err := stub.PutState(args[0], dataAsBytes)
   if err != nil {
      return shim.Error(err.Error())
   }

   return shim.Success(([]byte("add Pet tx is submitted")))
}

func (s *SmartContract) addPetInfo(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {
   if len(args) != 4 {
      return shim.Error("Incorrect number of arguments. Expecting 4")
   }
   // getState User
   userAsBytes, err := APIstub.GetState(args[0])
   if err != nil {
      jsonResp := "\"Error\":\"Failed to get state for " + args[0] + "\"}"
      return shim.Error(jsonResp)
   } else if userAsBytes == nil { // no State! error
      jsonResp := "\"Error\":\"Pet does not exist: " + args[0] + "\"}"
      return shim.Error(jsonResp)
   }
   // state ok
   user := Information{}
   err = json.Unmarshal(userAsBytes, &user)
   if err != nil {
      return shim.Error(err.Error())
   }
   // update  pet info structure
   if args[1] == "owner" {
      user.CarePerson = args[2]
      user.Address = args[3]
   } else {
      shim.Error("not supported update type")
   }

   userAsBytes, err = json.Marshal(user)

   APIstub.PutState(args[0], userAsBytes)

   return shim.Success([]byte("pet information is updated"))
}
func (s *SmartContract) readPet(APIstub shim.ChaincodeStubInterface, args []string) sc.Response {

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
