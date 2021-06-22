import React, {Component} from "react"
import MeldingList from "./MeldingList";


class App extends Component {
  render (){
    return (
        <div>
          <h1>eMottak meldinger</h1>
          <MeldingList/>
        </div>
    )
  }
}
export default App
