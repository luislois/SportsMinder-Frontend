import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Fix for default marker icon
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const Map = ({ trackName, lat, lng }) => {
  const position = [lat, lng];
  const googleMapsLink = `https://www.google.com/maps?q=${lat},${lng}`;

  return (
    <MapContainer
      center={position}
      zoom={18}
      style={{ width: "100%", height: "45vh" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={position}>
        <Popup>
          {trackName}
          <br />
          <a href={googleMapsLink} target="_blank" rel="noopener noreferrer">
            View on Google Maps
          </a>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;
