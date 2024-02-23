import path from "path"
import * as grpc from "@grpc/grpc-js"
import * as protoLoader from "@grpc/proto-loader" 
import {ProtoGrpcType} from './proto/random'

const PORT = 8082

const packageDef = protoLoader.loadSync(path.resolve(__dirname, './proto/random.proto'))
const grpcObject = (grpc.loadPackageDefinition(packageDef) as unknown) as ProtoGrpcType

const client = new grpcObject.randomPackage.Random(
    `0.0.0.0:${PORT}`, grpc.credentials.createInsecure()
)

const deadline = new Date()
deadline.setSeconds(deadline.getSeconds() + 5)
client.waitForReady(deadline, (err) => {
    if(err){
        console.error(err)
        return
    }
    onClientReady()
})

function onClientReady(){
    client.PingPong({message: "Helloo"}, (err, result) => {
        if(err){
            console.error(err)
            return
        }
        console.log(result);
    })

    const stream = client.RandomNumbers({maxVal: 100})
    stream.on('data', (chunk) => {
        console.log(chunk.num);
    })
    stream.on("end", () => {
        console.log('stream ended');
    })

    const todoStream = client.TodoList((err, result) => {
        if(err){
            console.error(err)
            return
        }
        console.log(result);
    })
    todoStream.write({todo: "abcd", status: "done"})
    todoStream.write({todo: "efgs", status: "not done"})
    todoStream.write({todo: "inds", status: "done"})
    todoStream.write({todo: "fjdk", status: "not done"})
    todoStream.end()

}