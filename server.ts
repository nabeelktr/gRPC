import path from "path"
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader" 
import {ProtoGrpcType} from './proto/random'
import { RandomHandlers } from './proto/randomPackage/Random'
import { TodoResponse } from "./proto/randomPackage/TodoResponse"

const PORT = 8082

const packageDef = protoLoader.loadSync(path.resolve(__dirname, './proto/random.proto'))
const grpcObject = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType
const randomPackage = grpcObject.randomPackage

const todoList: TodoResponse= {todoRequests:[]};

function main(){
    const server = getServer()
    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err, port) => {
        if(err){
            console.log(err);
            return
        }
        console.log('your server started on port ', PORT);
    })
}

function getServer(){
    const server = new grpc.Server()
    server.addService(randomPackage.Random.service, {
        PingPong : (req, res) => {
            console.log(req.request);
            res(null, {message: "Pong"})
        },

        RandomNumbers: (call) =>{
            const {maxVal} = call.request;
            let count = 0;
            const intervalId = setInterval(()=>{
            count++;
            call.write({num : Math.floor(Math.random() * (maxVal || 10) )})
                if(count >= 10) call.end()
            },500)
        },

        TodoList : (call, callback) => {
            call.on("data", (chunk) => {
                console.log(chunk);
                todoList.todoRequests?.push(chunk)
            })
            call.on("end", () => {
                callback(null, {todoRequests: todoList.todoRequests})
            })
        }

    } as RandomHandlers)
    return server
}

main();