import DeMed from "../abis/DeMed.json";
import React, { Component } from "react";
import { Card, Button, Form } from "react-bootstrap";

import Navbar from "./Navbar";

import Web3 from "web3";
import axios from 'axios';
import "./App.css";
import { HuddleIframe, IframeConfig } from "@huddle01/huddle01-iframe";

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
class App extends Component {
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
    const networkAdress = "0x3b79859735Cc779c21Cd3Bd7f62705bA893cE4CF";
    // const networkAdress = "0xE4f76e3aE3C6D77Ad74E5276663F9e79D066CE6B"

    if (networkAdress) {
      const demed = new web3.eth.Contract(DeMed, networkAdress);
      console.log("here");
      console.log(demed);

      this.setState({ demed });

      console.log("here");


      this.setState({ loading: false });
    } else {
      window.alert("Smart contract not deployed to detected network.");
    }
  }
  getMeetWithPatient = async () => {
    console.log("Get Meet Called");
    const patientId = this.state.meetPatientId;
    console.log(patientId)
    // const contextCase = this.state.cases[caseId - 1];
    let meetlink = await this.state.demed.methods
      .getMeetLink(parseInt(patientId))
      .call();
    this.state.meetdetailsfetched = true;
    this.state.currentMeetUrl = meetlink;

    this.state.iframeConfig.roomUrl = 'https://iframe.huddle01.com/' + meetlink
    console.log(meetlink)

  };
  getReportsOfPatient = async () => {
    console.log("Get Report Called");
    const patientId = this.state.getPatientId;
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

  captureFile = (event) => {
    event.preventDefault();
    const file = event.target.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);

    reader.onloadend = () => {
      this.setState({ buffer: Buffer(reader.result) });
      console.log("buffer", this.state.buffer);
    };
  };

  uploadFile = () => {
    console.log("Submitting file to ipfs...");


    return new Promise(async (resolve, reject) => {
      console.log("new working...");
      try {
        const { cid } = await ipfs.add(this.state.buffer);
        resolve(cid.toString());

        console.log(cid.toString());

        this.state.demed.methods
          .addReport(
            this.state.recordDetails.patientId,
            cid.toString(),

            this.state.recordDetails.createdDate,
            this.state.recordDetails.description,

          )
          .send({ from: this.state.account })
          .on("transactionHash", (hash) => {
            window.location.reload();
            this.setState({ loading: false });
          });
      } catch (error) {
        reject(error);
      }
    });
  };
  registerPatient = async () => {
    console.log("Registering Patient...");

    console.log(this.state.newPatient);
    this.setState({ loading: true });
    const meetLink = await axios.post(
      'https://iriko.testing.huddle01.com/api/v1/create-iframe-room',
      {
        title: 'DotMed Meeting',
        roomLocked: false
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'VwTZ4AGTxme9snANex9tep3NwvVMGfYd',
        },
      }
    );
    console.log(meetLink.data.data.roomId)
    this.state.demed.methods
      .addPatient(
        this.state.newPatient.hospitalId,
        this.state.newPatient.age,
        this.state.newPatient.height,
        this.state.newPatient.weight,
        this.state.newPatient.bloodGroup,
        this.state.newPatient.gender,
        this.state.newPatient.address,
        meetLink.data.data.roomId

      )
      .send({ from: this.state.account })
      .on("transactionHash", async (hash) => {
        let newpatientId = parseInt(await this.state.demed.methods.noOfPatients().call());

        window.alert("Successfully registered with Patient ID: " + newpatientId);
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
  meetPatientId
  handleMeetUserInput = (event) => {
    this.setState({
      meetPatientId: event.target.value,
    });
  };


  constructor(props) {
    super(props);
    this.state = {
      account: "",
   
      loading: true,
      recordDetails: {
        patientId: "",
        description: "",

        createdDate: "",
      },
      newPatient: {
        hospitalId: "",

        height: "",
        weight: "",
        bloodGroup: "",
        age: "",
        address: "",
        gender: ""
      },
      uploadedImage: "",
      cases: [],
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

    this.uploadFile = this.uploadFile.bind(this);
    this.captureFile = this.captureFile.bind(this);
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
                    {/* <Card>
                      <Card.Header as="h2">Meet Patient</Card.Header>
                      <Card.Body>

                        <div>
                          <HuddleIframe config={this.state.iframeConfig} />
                        </div>
                      </Card.Body>
                    </Card> */}
                    <Card>
                      <Card.Header as="h2">Register Patient</Card.Header>
                      <Card.Body>
                        <Card.Title>
                          Provide the below details to register a patient.
                        </Card.Title>

                        <Form
                          onSubmit={(event) => {
                            console.log("Form Submitted");
                            event.preventDefault();
                            this.registerPatient();
                          }}
                        >
                          <Form.Group className="mb-3">
                            <Form.Label>Hospital ID</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Hospital ID"
                              value={this.state.newPatient.hospitalId}
                              onChange={this.handlePatientRegInputChange}
                              name="hospitalId"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Metamask Wallet Address</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Address"
                              value={this.state.newPatient.address}
                              onChange={this.handlePatientRegInputChange}
                              name="address"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Gender</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Gender"
                              value={this.state.newPatient.gender}
                              onChange={this.handlePatientRegInputChange}
                              name="gender"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Age</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Age"
                              value={this.state.newPatient.age}
                              onChange={this.handlePatientRegInputChange}
                              name="age"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Height</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Height"
                              value={this.state.newPatient.height}
                              onChange={this.handlePatientRegInputChange}
                              name="height"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Weight</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Weight"
                              value={this.state.newPatient.weight}
                              onChange={this.handlePatientRegInputChange}
                              name="weight"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Blood Group</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Blood Group"
                              value={this.state.newPatient.bloodGroup}
                              onChange={this.handlePatientRegInputChange}
                              name="bloodGroup"
                            />
                          </Form.Group>
                          <Button variant="primary" type="submit">
                            Register Patient
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>
                    <br />
                    <br />
                    <Card>
                      <Card.Header as="h2">Create a new record</Card.Header>
                      <Card.Body>
                        <Card.Title>
                          Provide the below details to submit a new record.
                        </Card.Title>

                        <Form
                          onSubmit={(event) => {
                            console.log("Form Submitted");
                            event.preventDefault();

                            this.uploadFile();
                          }}
                        >
                          <Form.Group className="mb-3">
                            <Form.Label>Patient ID</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Patient ID"
                              value={this.state.recordDetails.patientId}
                              onChange={this.handleRecordInputChange}
                              name="patientId"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Upload File</Form.Label>
                            <Form.Control
                              type="file"
                              id="fname"
                              onChange={this.captureFile}
                              name="fileHash"
                              placeholder="Enter the Hash"
                            />
                          </Form.Group>
                          <Form.Group className="mb-3">
                            <Form.Label>Date</Form.Label>
                            <Form.Control
                              type="date"
                              placeholder="Select Date"
                              name="createdDate"
                              id="dateofbirth"
                              value={this.state.recordDetails.createdDate}
                              onChange={this.handleRecordInputChange}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3">
                            <Form.Label>Report Description</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              placeholder="Report Description"
                              value={this.state.recordDetails.description}
                              onChange={this.handleRecordInputChange}
                              name="description"
                            />
                          </Form.Group>

                          <Button variant="primary" type="submit">
                            Submit Record
                          </Button>
                        </Form>
                      </Card.Body>
                    </Card>
                    <br />
                    <br />
                    <Card>
                      <Card.Header as="h2">Get records of a patient</Card.Header>
                      <Card.Body>
                        <Form
                          onSubmit={(event) => {
                            console.log("Form Submitted");
                            event.preventDefault();

                            this.getReportsOfPatient();
                            
                          }}
                        >
                          <Form.Group className="mb-3">
                            <Form.Label>Patient ID</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Patient ID"
                              value={this.state.getPatientId}
                              onChange={this.handleEvidenceCaseInput}
                              name="patientId"
                            />
                          </Form.Group>

                          <Button variant="primary" type="submit">
                            Get Records
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
                      <Card.Header as="h2">Meeting with Patient</Card.Header>
                      <Card.Body>
                        <Form
                          onSubmit={async (event) => {
                            console.log("Form Submitted");
                            event.preventDefault();

                            await this.getMeetWithPatient();
                            console.log(this.state.currentMeetUrl)
                            console.log("https://app.huddle01.com/" + this.state.currentMeetUrl)
                            window.open("https://app.huddle01.com/" + this.state.currentMeetUrl);
                          }}
                        >
                          <Form.Group className="mb-3">
                            <Form.Label>Patient ID</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Patient ID"
                              value={this.state.meetPatientId}
                              onChange={this.handleMeetUserInput}
                              name="patientId"
                            />
                          </Form.Group>

                          <Button variant="primary" type="submit">
                            Join Meeting 
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

export default App;
