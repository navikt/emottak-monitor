import React, { useState}  from "react"
import { Route, Switch } from 'react-router-dom'
import "nav-frontend-tabell-style";
import MessagesTable from "./MessagesTable";
import axios from "axios"

//function getMessages() {
//    axios.get("https://emottak-monitor.dev.intern.nav.no/v1/hentmeldinger?fromDate=01-01-2021%2010:10:10&toDate=01-01-2021%2010:16:10")
//        .then(response => { this.setState({messages : response.data})});
//    }

// const getMessages = async () => {
//     try {
//         return await axios.get('https://emottak-monitor.dev.intern.nav.no/v1/hentmeldinger?fromDate=01-01-2021%2010:10:10&toDate=01-01-2021%2010:16:10');
//     } catch (error) {
//         console.error(error)
//     }
// }
//
// const messages = async () => {
//     const messageResponse = await getMessages()
//     if(messageResponse.data) {
//         console.log(`Got ${Object.entries(messageResponse.data).length} messages`)
//         return messageResponse.data
//     }
// }

export default function App() {
    const [messages, setMessages] = useState([])
    console.log("Messages = " + messages)
    return (
        <div className="App">
            <Switch>
                <Route exact path="/">
                    <h1>eMottak meldinger</h1>
                    {/*<MessagesTable messages={DBMessages}/>*/}
                    <MessagesTable messages={messages}/>
                </Route>
                <Route exact path="/isalive" status={200}>
                    <h1>Alive</h1>
                </Route>
                <Route exact path="/isready" status={200}>
                    <h1>Ready</h1>
                </Route>
                <Route exact path="/metrics" status={200}>
                    <h1>Metrics</h1>
                </Route>
            </Switch>
        </div>
    );
}
