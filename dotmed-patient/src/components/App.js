import * as React from 'react';
import { Routes, Route } from 'react-router-dom';

import Home from './Home';
import NoPatient from './NoPatient';
import Register from './Register';


export default function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nopatient" element={<NoPatient />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}