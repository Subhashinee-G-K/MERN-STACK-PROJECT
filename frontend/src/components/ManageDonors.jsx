import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ManageDonors = () => {
  const [donors, setDonors] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/donations')
      .then(res => setDonors(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Donor Management</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Donor Name</th>
            <th>Food Name</th>
            <th>Quantity</th>
            <th>Location</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          {donors.map((donor, index) => (
            <tr key={index}>
              <td>{donor.donorName}</td>
              <td>{donor.foodName}</td>
              <td>{donor.quantity}</td>
              <td>{donor.location}</td>
              <td>{donor.contact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManageDonors;
