import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import { Input, Button, Row, Col } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import axios from "axios";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPicker = ({ onSelect, initialPosition }) => {
  const [position, setPosition] = useState(
    initialPosition || { lat: 0, lng: 0 }
  );

  const [search, setSearch] = useState("");

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
    }
  }, [initialPosition]);

  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  }, []);

  const handleSearch = () => {
    axios
      .get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: search,
          format: "json",
        },
      })
      .then((response) => {
        if (response.data.length > 0) {
          const { lat, lon } = response.data[0];
          const newPosition = { lat: parseFloat(lat), lng: parseFloat(lon) };
          setPosition(newPosition);
          onSelect(newPosition);
        }
      })
      .catch((error) => {
        console.error("Error during geocoding:", error);
      });
  };

  const MapEventsHandler = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onSelect(e.latlng);
      },
    });
    return null;
  };

  const MapUpdater = () => {
    const map = useMap();
    useEffect(() => {
      map.setView([position.lat, position.lng], map.getZoom());
    }, [position, map]);
    return null;
  };

  return (
    <div>
      <Row gutter={16}>
        <Col span={12}>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search for a location"
          />
        </Col>
        <Col span={12}>
          <Button
            onClick={handleSearch}
            type="primary"
            style={{ marginBottom: "10px" }}
          >
            <SearchOutlined />
          </Button>
        </Col>
      </Row>

      <MapContainer
        center={position}
        zoom={13}
        style={{ width: "100%", height: "50vh" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        <MapEventsHandler />
        <MapUpdater />
      </MapContainer>
    </div>
  );
};

export default MapPicker;
