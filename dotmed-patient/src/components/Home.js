import DeMed from "../abis/DeMed.json";
import React, { Component } from "react";
import { Card, Button, Form } from "react-bootstrap";

import Navbar from "./Navbar";

import Web3 from "web3";
import axios from 'axios';
import "./App.css";
import { HuddleIframe, IframeConfig } from "@huddle01/huddle01-iframe";
import { useNavigate } from 'react-router-dom';
import HealthCard from '../assets/card.jpg';

//Declare IPFS
const ipfsClient = require("ipfs-http-client");
const projectId = "2PJiFNi3lUttZvIkT6Y8oeWHwg9";
const projectSecret = "a9e9eeb2e4dbdbe38b0ada9e3b258899";
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);
// const ipfs = ipfsClient({
//   host: "ipfs.infura.io",
//   port: 5001,
//   protocol: "https",
// }); // leaving out the arguments will default to these values

const ipfs = ipfsClient.create({
  url: "https://ipfs.infura.io:5001/api/v0",
  headers: {
    authorization,
  },
});
class Home extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
    
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  async loadBlockchainData() {
    const web3 = window.web3;
    // Load account
    const accounts = await web3.eth.getAccounts();

    this.setState({ account: accounts[0] });
    // Network ID
    const networkId = await web3.eth.net.getId();
    const networkAdress = "0x46aCEb309B371cb7073Db48e4752626f48f38E0F";
    // const networkAdress = "0xE4f76e3aE3C6D77Ad74E5276663F9e79D066CE6B"

    if (networkAdress) {
      const demed = new web3.eth.Contract(DeMed, networkAdress);
      console.log("here");
      console.log(demed);

      this.setState({ demed });

      console.log("fetching user details");
   
      let patientDetails = await this.state.demed.methods
      .getPatientDetails(this.state.account)
      .call();
      console.log(patientDetails.meetlink)
// console.log(patientDetails)
// const navigate = useNavigate();
if(!patientDetails.meetlink.length>0){
    // navigate('/nopatient', { replace: true });
    window.location.href = '/nopatient';
}
if(!patientDetails.username.length>0){
    // navigate('/nopatient', { replace: true });
    this.state.hasusername=false
}


      this.state.patientData.hospital_id=patientDetails.hospital_id;
      this.state.patientData.patient_address=patientDetails.patient_address;
      this.state.patientData.patient_id=parseInt(patientDetails.patient_id);
      this.state.patientData.meetlink=patientDetails.meetlink;
      this.state.patientData.noOfReports=patientDetails.noOfReports;
      this.state.patientData.beneficiaries=patientDetails.beneficiaries
      this.state.patientData.accessAddress=patientDetails.accessAddress
      this.state.patientData.username=patientDetails.username

      console.log(this.state.patientData)


      this.setState({ loading: false });
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }
  getMeetwithDoctor = async () => {
    console.log("Get Meet Called");
    window.open("https://app.huddle01.com/" + this.state.patientData.meetlink);

  };
  registerUsername = async () => {
    console.log("Adding Username...");
   
console.log(this.state.patientData.patient_id)
console.log(this.state.username+".med")
    this.state.demed.methods
        .addUsername(
            this.state.patientData.patient_id,
            this.state.username+".med"


        )
        .send({ from: this.state.account })
        .on("transactionHash", async (hash) => {
          this.state.hasusername=true
            window.alert("Successfully registered username");
            this.setState({ loading: false });
            window.location.href = '/';
        });
};
  getReportsOfPatient = async () => {
    console.log("Get Report Called");
    const patientId = this.state.patientData.patient_id;
    // const contextCase = this.state.cases[caseId - 1];
    let reportCount = await this.state.demed.methods
      .getCount(parseInt(patientId))
      .call();
    console.log(reportCount)
    for (var j = 0; j < reportCount; j++) {
      let repo = await this.state.demed.methods
        .getReportById(patientId, j)
        .call();
      console.log(repo)
      this.setState({
        reports: [...this.state.reports, repo],
      });
      console.log(repo)
    }
    console.log(this.state.reports);
  };


  addBeneficiary = async () => {
    console.log("Adding Beneficiary...");

  
    this.state.demed.methods
      .addBeneficiary(
        this.state.patientData.patient_id,
        this.state.benefAddress
       

      )
      .send({ from: this.state.account })
      .on("transactionHash", async (hash) => {

        window.alert("Successfully added Beneficiary");
        this.setState({ loading: false });
      });
  };
   addAccess = async () => {
    console.log("Adding Access...");

  
    this.state.demed.methods
      .addAccess(
        this.state.patientData.patient_id,
        this.state.accessAddress
       

      )
      .send({ from: this.state.account })
      .on("transactionHash", async (hash) => {

        window.alert("Successfully added Access");
        this.setState({ loading: false });
      });
  };

 

  handlePatientRegInputChange = (event) => {
    this.setState({
      newPatient: {
        ...this.state.newPatient,
        [event.target.name]: event.target.value,
      },
    });
  };
  handleRecordInputChange = (event) => {
    this.setState({
      recordDetails: {
        ...this.state.recordDetails,
        [event.target.name]: event.target.value,
      },
    });
  };
  handleEvidenceCaseInput = (event) => {
    this.setState({
      getPatientId: event.target.value,
    });
  };

  handleBeneficiaryUserInput = (event) => {
    this.setState({
      benefAddress: event.target.value,
    });
  };

  handleAccessUserInput = (event) => {
    this.setState({
      accessAddress: event.target.value,
    });
  };
  handleUsernameInput = (event) => {
    this.setState({
        username: event.target.value,
    });
};
  constructor(props) {
    super(props);
    this.state = {
      account: "",
   
      loading: true,
      patientData: {
        patient_address: "",
        patient_id:"",
        hospital_id: "",
     
        meetlink:"",

        noOfReports: "",
        beneficiaries:[],
        accessAddress:[],
        username:""
       
      },
      benefAddress:"",
      accessAddress:"",

      uploadedImage: "",
      username:"",
    hasusername:true,
      reports: [],
      getPatientId: "",
      iframeConfig: {
        roomUrl: "https://iframe.huddle01.com/111",
        height: "600px",
        width: "100%",
        noBorder: true, // false by default
      },
      currentMeetUrl: "",
      meetdetailsfetched: false,
      meetPatientId: ""
    };

  }

  render() {
    return (
      <div>
        <Navbar account={this.state.account} />
        {this.state.loading ? (
          <div id="loader" className="text-center mt-5">
            <p>Loading...</p>
          </div>
        ) : (
          <div>
            <div className="container-fluid mt-5">
              <div className="row">
                <main
                  role="main"
                  className="col-lg-12 ml-auto mr-auto"
                  style={{ maxWidth: "500px" }}
                >
                  <div className="content mr-auto ml-auto">
                    <p>&nbsp;</p>
                    {this.state.hasusername ? (
        <div></div>):(<div>
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
                                    </div>)}
                    <Card>
                      <Card.Body as="h3">Hi {this.state.patientData.username}</Card.Body>
                      <img className="col-lg-12" src={HealthCard}/>

                    </Card>
                    <br/>
                    <br/>
                    <Card>
                      <Card.Header as="h2">Meeting with Doctor</Card.Header>
                      <Card.Body>
                        <Form
                          onSubmit={(event) => {
                            console.log("Form Submitted");
                            event.preventDefault();

                            this.getMeetwithDoctor();
                            
                          }}
                        >
                    

                          <Button variant="primary" type="submit">
                        Join Meeting
                          </Button>

                        </Form>
                      </Card.Body>
                    </Card>
                    <br/>
                    <br/>
                 <Card>
                      <Card.Header as="h2">Previous Medical Records</Card.Header>
                      <Card.Body>
                        <Form
                          onSubmit={(event) => {
                            console.log("Form Submitted");
                            event.preventDefault();

                            this.getReportsOfPatient();
                            
                          }}
                        >
                    

                          <Button variant="primary" type="submit">
                            Show Records
                          </Button>

                        </Form>
                      </Card.Body>
                    </Card>
                    
                    {this.state.reports.length > 0 ? (
                      this.state.reports.map((report, key) => {
                        return (
                          <div className="card mb-4" key={key}>
                            <ul
                              id="imageList"
                              className="list-group list-group-flush"
                            >
                              <li className="list-group-item">
                                <p className="text-center">
                                  <img
                                    src={`https://ipfs.io/ipfs/${report[1]}`}
                                    style={{ maxWidth: "420px" }}
                                  />
                                </p>
                                <p>Report Description: {report[4]}</p>
                                <p>Date: {report[5]}</p>

                              </li>
                            </ul>
                          </div>

                        );
                      })
                    ) : (
                      <p></p>
                    )}
                    <br />
                    <br />
                    <Card>
                      <Card.Header as="h2">Add Access</Card.Header>
                      <Card.Body>
                        <Form
                          onSubmit={(event) => {
                            console.log("Form Submitted");
                            event.preventDefault();

                            this.addAccess();
                            
                          }}
                        >
                          <Form.Group className="mb-3">
                            <Form.Label>Doctor Address</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Doctor Address"
                              value={this.state.accessAddress}
                              onChange={this.handleAccessUserInput}
                              name="doctorAddress"
                            />
                          </Form.Group>

                          <Button variant="primary" type="submit">
                            Add Access
                          </Button>

                        </Form>
                      </Card.Body>
                    </Card>
                    <br/>
                    <br/>
                    <Card>
                      <Card.Header as="h2">Add Beneficiary</Card.Header>
                      <Card.Body>
                        <Form
                          onSubmit={async (event) => {
                            console.log("Form Submitted");
                            event.preventDefault();

                            await this.addBeneficiary();
         
                          }}
                        >
                          <Form.Group className="mb-3">
                            <Form.Label>Beneficiary Address</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Beneficiary Address"
                              value={this.state.benefAddress}
                              onChange={this.handleBeneficiaryUserInput}
                              name="beneficiaryAddress"
                            />
                          </Form.Group>

                          <Button variant="primary" type="submit">
                         Add Beneficiary 
                          </Button>
                      
                        </Form>
                      </Card.Body>
                    </Card>


                  </div>

                </main>
              </div>
            </div>
          </div>

        )}

      </div>
    );
  }
}

export default Home;
