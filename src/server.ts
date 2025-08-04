import WebSocket from "ws";
import * as fs from "fs/promises";
import type { Message } from "./types";

const wss = new WebSocket.Server({ port: 8080 });

let chatData: Message[] = [];

async function readData() {
    try {
        const readData = await fs.readFile("chat_data.dat", "utf-8");
        chatData = JSON.parse(readData.toString());
    } catch (err) {
        console.error(`error: ${err}`);
    }
}

async function writeData() {
    try {
        await fs.writeFile("chat_data.dat", JSON.stringify(chatData), "utf-8");
        console.log("データを保存しました");
    } catch (err) {
        console.error(`error: ${err}`)
    }
}

async function operationServer() {
    await readData();
    for (let chat of chatData) {
        console.log(`${chat.name}#${chat.id} > ${chat.text}`);
    }

    wss.on("connection", (ws) => {
        const initData: Message = {
            type: 0,
            id: Math.round(Math.random() * 1000)
        }
        ws.send(JSON.stringify(initData));

        console.log(`新しいクライアントが接続しました: #${initData.id}`);

        for (let chat of chatData) {
            ws.send(JSON.stringify(chat));
        }

        ws.on("message", (message) => {
            const messageObject = JSON.parse(message.toString());
            console.log(`${messageObject.name}#${messageObject.id} > ${messageObject.text}`);
            chatData.push(messageObject);
            wss.clients.forEach((client) => {
                client.send(message.toString());
            })
        })
    })

    setInterval(writeData, 20000);
}
operationServer();