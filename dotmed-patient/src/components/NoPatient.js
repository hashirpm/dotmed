
import React, { Component } from "react";
import { Card, Button, Form } from "react-bootstrap";

import Navbar from "./Navbar";

import "./App.css";



class NoPatient extends Component {




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
                    <h1>No Patient</h1>
                    </main>
                    </div>
                    </div>
                    </div>
                </div>


            </div>
        );
    }
}

export default NoPatient;
