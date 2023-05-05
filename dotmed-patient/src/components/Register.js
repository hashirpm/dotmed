
import React, { Component } from "react";
import { Card, Button, Form } from "react-bootstrap";

import Navbar from "./Navbar";

import "./App.css";
import DeMed from "../abis/DeMed.json";

import Web3 from "web3";


class Register extends Component {
    async componentWillMount() {

        const search = window.location.href; // returns the URL query String
        const temp = search.split("?")
        console.log(temp)
        this.state.patient_id = temp[1].split("=")[1]
        this.state.account = temp[2].split("=")[1]
        console.log(this.state.account)
    }
    constructor(props) {
        super(props);
        this.state = {
            patient_id: "",
            username: "",
            account:""

        };

    }


    registerUsername = async () => {
        console.log("Adding Username...");
        const networkAdress = "0x4B506D1500c87A13605F2e64eAB4a5111FED7bf2";
        // const networkAdress = "0xE4f76e3aE3C6D77Ad74E5276663F9e79D066CE6B"
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            await window.ethereum.enable();
          } else if (window.web3) {
            window.web3 = new Web3(window.web3.currentProvider);
          }
        const web3 = window.web3;
        if (networkAdress) {
          const demed = new web3.eth.Contract(DeMed, networkAdress);
          console.log("here");
          console.log(demed);
    
          this.setState({ demed });
        }
console.log(this.state.patient_id)
console.log(this.state.username+".med")
        this.state.demed.methods
            .addUsername(
                this.state.patient_id,
                this.state.username+".med"


            )
            .send({ from: this.state.account })
            .on("transactionHash", async (hash) => {

                window.alert("Successfully registered username");
                this.setState({ loading: false });
                window.location.href = '/';
            });
    };
    handleUsernameInput = (event) => {
        this.setState({
            username: event.target.value,
        });
    };
    render() {
        return (
            <div>
                <Navbar account="" />

                <div className="text-center mt-10">
                    <div>
                        <div className="container-fluid mt-5">
                            <div className="row">
                                <main
                                    role="main"
                                    className="col-lg-12 ml-auto mr-auto"
                                    style={{ maxWidth: "500px" }}
                                >
                                    <Card>
                                        <Card.Header as="h2">Register Username</Card.Header>
                                        <Card.Body>
                                            <Form
                                                onSubmit={(event) => {
                                                    console.log("Form Submitted");
                                                    event.preventDefault();

                                                    this.registerUsername();

                                                }}
                                            >
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Username</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        placeholder="Username"
                                                        value={this.state.username}
                                                        onChange={this.handleUsernameInput}
                                                        name="username"
                                                    />
                                                </Form.Group>

                                                <Button variant="primary" type="submit">
                                                    Register Username
                                                </Button>

                                            </Form>
                                        </Card.Body>
                                    </Card>
                                </main>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        );
    }
}

export default Register;
