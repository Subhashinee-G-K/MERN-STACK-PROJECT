import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AvailableDonations = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Fetch available donations from the backend
  useEffect(() => {
    const fetchDonations = (latitude, longitude) => {
      console.log('📡 Fetching donations near:', latitude, longitude);
      axios.get('http://localhost:5000/donations', {
        params: {
          lat: latitude,
          lon: longitude,
        },
      })
        .then((response) => {
          let sortedDonations = response.data;

          if (latitude && longitude) {
            sortedDonations = response.data.map(donation => {
              // Add distance property to each donation
              return {
                ...donation,
                distance: calculateDistance(
                  latitude, 
                  longitude, 
                  donation.latitude, 
                  donation.longitude
                ),
              };
            }).sort((a, b) => a.distance - b.distance);
          }

          // Remove perishable donations older than 3 hours
          const filteredDonations = sortedDonations.filter(donation => {
            const currentTime = new Date().getTime();
            const donationTime = new Date(donation.donationTime).getTime();
            const timeDiff = currentTime - donationTime;
            return timeDiff < 3 * 60 * 60 * 1000; // 3 hours in milliseconds
          });

          console.log('✅ Donations fetched (sorted):', filteredDonations);
          setDonations(filteredDonations);
          setLoading(false);
        })
        .catch((error) => {
          console.error('❌ Error fetching donations:', error);
          setError('Failed to fetch donations.');
          setLoading(false);
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetchDonations(latitude, longitude);
        },
        (error) => {
          console.warn('⚠️ Location access denied. Showing all donations.');
          fetchDonations(null, null); // fallback
        }
      );
    } else {
      console.warn('⚠️ Geolocation not supported. Showing all donations.');
      fetchDonations(null, null); // fallback
    }

    // Set an interval to remove expired donations every minute
    const interval = setInterval(() => {
      setDonations(prevDonations => 
        prevDonations.filter(donation => {
          const currentTime = new Date().getTime();
          const donationTime = new Date(donation.donationTime).getTime();
          const timeDiff = currentTime - donationTime;
          return timeDiff < 3 * 60 * 60 * 1000; // 3 hours in milliseconds
        })
      );
    }, 60000); // Check every 60 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Claim a donation
  const handleOrder = async (id) => {
    try {
      await axios.put(`http://localhost:5000/donations/${id}/status`, {
        status: 'Accepted', // this sets received = true in the backend
      });
      setDonations((prevDonations) =>
        prevDonations.filter((donation) => donation._id !== id)
      );
      alert('🎉 Order placed successfully!');
    } catch (err) {
      console.error('Error claiming donation:', err.response?.data || err.message);
      alert('⚠️ Failed to place order. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2>🍱 Available Donations</h2>
      {loading ? (
        <p>Loading donations...</p>
      ) : error ? (
        <p>{error}</p>
      ) : donations.length === 0 ? (
        <p>No donations available at the moment.</p>
      ) : (
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thTdStyle}>Food</th>
              <th style={thTdStyle}>Donor</th>
              <th style={thTdStyle}>Quantity</th>
              <th style={thTdStyle}>Location</th>
              <th style={thTdStyle}>Distance</th>
              <th style={thTdStyle}>Contact</th>
              <th style={thTdStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation._id}>
                <td style={thTdStyle}>{donation.foodName}</td>
                <td style={thTdStyle}>{donation.donorName}</td>
                <td style={thTdStyle}>{donation.quantity}</td>
                <td style={thTdStyle}>{donation.location}</td>
                <td style={thTdStyle}>
                  {donation.distance ? `${donation.distance.toFixed(1)} km` : 'N/A'}
                </td>
                <td style={thTdStyle}>{donation.contact}</td>
                <td style={thTdStyle}>
                  <button
                    style={buttonStyle}
                    onClick={() => handleOrder(donation._id)}
                  >
                    Accept
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// Inline Styles
const containerStyle = {
  padding: '20px',
  maxWidth: '900px',
  margin: '0 auto',
  textAlign: 'center',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '20px',
};

const thTdStyle = {
  border: '1px solid #ddd',
  padding: '10px',
};

const buttonStyle = {
  backgroundColor: '#28a745',
  color: 'white',
  padding: '6px 12px',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default AvailableDonations;
