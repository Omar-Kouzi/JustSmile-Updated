import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useState } from "react";

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 33.8938,
  lng: 35.5018,
};

const MapPicker = ({ onSelect }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState("");

  const mapAPI = process.env.REACT_APP_MapAPI;

  // ✅ Proper loader (loads ONCE)
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: mapAPI,
  });

  const handleClick = (e) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results[0]) {
        const formattedAddress = results[0].formatted_address;

        const location = {
          lat,
          lng,
          address: formattedAddress,
        };

        setPosition({ lat, lng });
        setAddress(formattedAddress);
        onSelect(location);
      } else {
        const location = { lat, lng, address: "Address not found" };
        setPosition({ lat, lng });
        onSelect(location);
      }
    });
  };

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={12}
        onClick={handleClick}
      >
        {position && <Marker position={position} />}
      </GoogleMap>

      {address && (
        <div style={{ padding: "10px", background: "#fff" }}>
          <strong>Selected:</strong> {address}
        </div>
      )}
    </>
  );
};

export default MapPicker;