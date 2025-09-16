import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageReceivers = () => {
  const [receivers, setReceivers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/receiver-requests')
      .then(res => setReceivers(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Receiver Management</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Receiver Name</th>
            <th>Food Name</th>
            <th>Quantity Needed</th>
            <th>Location</th>
            <th>Contact</th>
            <th>Organization</th>
          </tr>
        </thead>
        <tbody>
          {receivers.map((receiver, index) => (
            <tr key={index}>
              <td>{receiver.receiverName}</td>
              <td>{receiver.foodName}</td>
              <td>{receiver.quantityNeeded}</td>
              <td>{receiver.location}</td>
              <td>{receiver.contact}</td>
              <td>{receiver.organizationName}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageReceivers;
