import React from "react";
import { Card, Row, Col, App as AntdApp } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

import { Link } from "react-router-dom";
import {
  srcTrackImage,
  renderTagForSport,
  renderTagForType,
} from "../utils/Utils";

const TrackCard = ({ track, isAdmin, showModalEdit, deleteTrack }) => {
  return (
    <Card
      hoverable
      style={{ width: "100%" }}
      cover={
        <Link
          to={{
            pathname: `/tracks/${track.id}`,
            state: { track },
          }}
        >
          <div style={{ height: "200px", overflow: "hidden" }}>
            <img
              alt="track image"
              src={srcTrackImage(track.sport, track.type)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>
        </Link>
      }
      actions={
        isAdmin
          ? [
              <EditOutlined
                key="edit"
                onClick={(e) => {
                  e.stopPropagation();
                  showModalEdit(track);
                }}
              />,
              <DeleteOutlined
                key="delete"
                style={{ color: "#ff4d4f" }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTrack(track.id);
                }}
              />,
            ]
          : null
      }
    >
      <Link to={{ pathname: "/tracks/" + track.id }}>
        <Card.Meta title={track.name} />
        <Row justify="space-between">
          <Col style={{ marginTop: 15 }}>
            {renderTagForSport(track.sport)}
            {renderTagForType(track.type)}
          </Col>
        </Row>
      </Link>
    </Card>
  );
};

export default TrackCard;
