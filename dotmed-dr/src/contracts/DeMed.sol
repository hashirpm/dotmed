// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract DeMed {
    string public name;
    string[] public patientAddresses;
    uint256 public noOfPatients;
    address[] public doctorAddresses;
    mapping(uint256 => PatientData) public patientDetails;

    constructor() public {
        name = "DeMed";
        noOfPatients=0;
    }

    struct PatientData {
        string patient_address;
        string hospital_id;
        string age;
        string height;
        string weight;
        string bloodGroup;
        string gender;
        string meetlink;
        string username;
        uint256 noOfReports;
       mapping(uint256 => ReportData) reports;
       string[] beneficiaries;
           string[] accessAddress;
    }
    struct DoctorData {
        address doctor_address;
        uint256 doctor_id;
        string hospital;
        string department;
    }

    struct ReportData {
        uint256 patient_id;
        string fileHash;
        address doctor;
        uint256 time;
        string description;
        string createdDate;
    }
      struct PatientInfo {
        string patient_address;
        uint256 patient_id;
        string hospital_id;
        string meetlink;
        uint256 noOfReports;
              string[] beneficiaries;
           string[] accessAddress;
                  string username;
       
    }
    event ReportAdded(string _fileHash, uint256 _patient_id);
    event PatientAdded(
        string age,
        string height,
        string weight,
        string bloodGroup,
        string gender
    );
    event DoctorAdded(uint256 doctor_id, string hospital, string department);
 

    mapping(address => mapping(uint256 => ReportData)) PatientFiles;
    mapping(address => PatientData) Patients;
    mapping(address => DoctorData) Doctors;

    function addDoctor(
        uint256 _doctor_id,
        string memory _hospital,
        string memory _department,
        address _address
    ) public returns (bool) {
        DoctorData memory _doctor;
        _doctor.doctor_address = _address;

        _doctor.doctor_id = _doctor_id;

        _doctor.hospital = _hospital;
        _doctor.department = _department;

        Doctors[msg.sender] = _doctor;
        doctorAddresses.push(msg.sender);

        emit DoctorAdded(_doctor_id, _hospital, _department);

        return true;
    }

    function addPatient(
        string memory _hospitalId,
        string memory _age,
         string memory _height,
         string memory _weight,
        string memory _bloodGroup,
        string memory _gender,
         string memory _address,
         string memory _meetlink
    ) public returns (bool) {
        
        PatientData storage _patient=patientDetails[noOfPatients];
        _patient.hospital_id=_hospitalId;
        _patient.patient_address = _address;
        _patient.age = _age;

        _patient.height = _height;

        _patient.weight = _weight;
        _patient.bloodGroup = _bloodGroup;

        _patient.gender = _gender;
        _patient.noOfReports = 0;
        _patient.meetlink=_meetlink;
        _patient.username='';
        patientAddresses.push(_address);
        noOfPatients = noOfPatients + 1; 
        emit PatientAdded(_age, _height, _weight, _bloodGroup, _gender);

        return true;
    }

    function addReport(
        uint256 _patient_id,
        string memory _fileHash,
        string memory _createdDate,
        string memory _description

    ) public returns (bool) {
        ReportData memory _record;
        _record.patient_id = _patient_id;
        _record.fileHash = _fileHash;
        _record.doctor = msg.sender;
        _record.description=_description;
        _record.createdDate=_createdDate;

        _record.time = block.timestamp;
        uint256 _record_id=patientDetails[_patient_id].noOfReports;
        patientDetails[_patient_id].reports[_record_id] = _record;
         patientDetails[_patient_id].noOfReports++;
        emit ReportAdded(_fileHash, _patient_id);

        return true;
    }

    // function changeVisibilty(
    //     address _patient_address,
    //     uint256 _record_id,
    //     bool _isVisible
    // ) public returns (bool) {
    //     PatientFiles[_patient_address][_record_id].isVisible = _isVisible;

    //     emit VisibilityChanged(_patient_address, _record_id, _isVisible);
    //     return true;
    // }

    function getPatientDetails(string memory _patient_address)
        public
        view
        returns (PatientInfo memory)
    {
   for (uint i = 0; i < patientAddresses.length; i++) {
        if (keccak256(bytes(patientAddresses[i])) == keccak256(bytes(_patient_address))) {
           PatientData storage contextPatient = patientDetails[i];
           PatientInfo memory _patientDetails;
            _patientDetails.patient_address=contextPatient.patient_address;
            _patientDetails.patient_id=i;
           _patientDetails.hospital_id=contextPatient.hospital_id;
                      _patientDetails.meetlink=contextPatient.meetlink;
                                 _patientDetails.noOfReports=contextPatient.noOfReports;
                                 _patientDetails.beneficiaries=contextPatient.beneficiaries;
                                _patientDetails.accessAddress=contextPatient.accessAddress;
                                _patientDetails.username=contextPatient.username;


         
    return _patientDetails;
        }
    }

    
    }

  function getCount(uint256 _patient_id)
        public
        view
        returns (uint256)
    {

        PatientData storage contextPatient = patientDetails[_patient_id];
  
        uint256 recordCount=contextPatient.noOfReports;

        return recordCount;
    }
    
      function getReportById(uint256 _patient_id,uint256 _report_id)
        public
        view
        returns (ReportData memory)
    {
        //make it only for doctors and owner
        ReportData memory contextRecord;
        PatientData storage contextPatient = patientDetails[_patient_id];

            contextRecord = contextPatient.reports[_report_id];
        

        return contextRecord;
    }
      function getMeetLink(uint256 _patient_id)
        public
        view
        returns (string memory)
    {

        PatientData storage contextPatient = patientDetails[_patient_id];
  
        string memory meetlink=contextPatient.meetlink;

        return meetlink;
    }
    function addBeneficiary(
        uint256 _patient_id,
        string memory _address_val
      

    ) public returns (bool) {


        PatientData storage contextPatient = patientDetails[_patient_id];
        contextPatient.beneficiaries.push(_address_val);
  
        return true;
    }
       function addAccess(
        uint256 _patient_id,
        string memory _address_val
    ) public returns (bool) {

        PatientData storage contextPatient = patientDetails[_patient_id];
        contextPatient.accessAddress.push(_address_val);
  
        return true;
    }
      function addUsername(
        uint256 _patient_id,
        string memory _username
      

    ) public returns (bool) {


     patientDetails[_patient_id].username=_username;

  
        return true;
    }
}
  

    
