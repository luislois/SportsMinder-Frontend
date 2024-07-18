import { useState, useEffect } from "react";
import Header from "../components/Header";
import { List, Col, Row, Select, Button, Form, App as AntdApp } from "antd";
import { useAuth0 } from "@auth0/auth0-react";
import TrackForm from "../components/Form";
import "../styles.css";
import TrackCard from "../components/TrackCard";

const { Option } = Select;

const Home = () => {
  const { modal, notification } = AntdApp.useApp();
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [filter, setFilter] = useState({ sport: "", type: "" });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTrackData, setEditTrackData] = useState(null);
  const { user } = useAuth0();

  const userRoles = user ? user["_roles"] : "Loading...";
  const isAdmin = userRoles && userRoles.includes("Admin");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetch("http://localhost:8080/api/tracks");
        const tracksData = await data.json();
        setTracks(tracksData);
      } catch (error) {
        console.error("Error fetching data from the API:", error);
      }
    };
    fetchData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
  };

  useEffect(() => {
    // Filter tracks based on user selection
    let filteredTracksResult = tracks;
    if (filter.sport) {
      filteredTracksResult = filteredTracksResult.filter(
        (track) => track.sport === filter.sport
      );
    }
    if (filter.type) {
      filteredTracksResult = filteredTracksResult.filter(
        (track) => track.type === filter.type
      );
    }
    setFilteredTracks(filteredTracksResult);
  }, [filter, tracks]);

  const handleResetFilter = () => {
    setFilter({ sport: "", type: "" });
  };

  const closeModalAdd = () => {
    setOpenAdd(false);
  };

  const showModalAdd = () => {
    setOpenAdd(true);
  };

  const closeModalEdit = () => {
    setOpenEdit();
  };

  const showModalEdit = (track) => {
    setEditTrackData(track);
    setOpenEdit(true);
  };

  const addTrack = async (form) => {
    setConfirmLoading(true);
    try {
      const trackData = await form.validateFields();
      console.log(trackData);
      const response = await fetch("http://localhost:8080/api/tracks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trackData),
      });

      if (!response.ok) {
        throw new Error("Track could not be added");
      }

      const newTrack = await response.json();
      // Update the state of tracks with the new track
      setTracks((prevTracks) => [...prevTracks, newTrack]);

      notification.open({
        placement: "top",
        type: "success",
        title: "SUCCESS",
        message: "Track added successfully.",
        duration: 3,
      });

      setTimeout(() => {
        form.resetFields();
        closeModalAdd();
        setConfirmLoading(false);
      }, 500);
    } catch (error) {
      form.resetFields();
      setConfirmLoading(false);
      console.error("Error adding track:", error);
      notification.open({
        placement: "top",
        type: "error",
        title: "ERROR",
        message: "Track could not be added.",
        duration: 3,
      });
    }
  };

  const deleteTrack = async (trackId) => {
    modal.confirm({
      title: "Are you sure you want delete this track?",
      content: "This action can not be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const response = await fetch(
            `http://localhost:8080/api/tracks/${trackId}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          if (response.ok) {
            notification.open({
              placement: "top",
              type: "success",
              title: "SUCCESS",
              message: `Track delete succesfully`,
              duration: 3,
            });
            setTracks(tracks.filter((track) => track.id !== trackId));
          }
        } catch (error) {
          console.error("Error deleting track:", error);
          notification.open({
            placement: "top",
            type: "error",
            title: "Error",
            message: "Failed to delete track",
            duration: 3,
          });
        }
      },
    });
  };

  const editTrack = async (form) => {
    const trackData = await form.validateFields();
    modal.confirm({
      title: "Are you sure you want edit this track?",
      content: "This action can not be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        setConfirmLoading(true);

        const response = await fetch(
          `http://localhost:8080/api/tracks/${editTrackData.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(trackData),
          }
        );
        if (response.ok) {
          const editedTrackIndex = tracks.findIndex(
            (track) => track.id === editTrackData.id
          );
          const updatedTracks = [...tracks];
          updatedTracks[editedTrackIndex] = {
            ...updatedTracks[editedTrackIndex],
            ...trackData,
          };
          setTracks(updatedTracks);

          notification.open({
            placement: "top",
            type: "success",
            title: "SUCCESS",
            message: `Track edit succesfully`,
            duration: 3,
          });
          setTimeout(() => {
            form.resetFields();
            closeModalEdit();
            setConfirmLoading(false);
          }, 500);
        } else {
          setTimeout(() => {
            form.resetFields();
            closeModalEdit();
            setConfirmLoading(false);
          }, 500);
          notification.open({
            placement: "top",
            type: "error",
            title: "Error",
            message: "Failed to edit track",
            duration: 3,
          });
        }
      },
    });
  };

  return (
    <div className="page-container">
      <Header />

      <div style={{ marginTop: 20 }}>
        <TrackForm
          title="Add Track"
          initialValues={null}
          openModal={openAdd}
          onOk={addTrack}
          onCancel={closeModalAdd}
        />
        <Row gutter={[16, 16]} justify="end">
          {isAdmin && (
            <Col>
              <Button type="primary" onClick={showModalAdd}>
                + Add Track
              </Button>
            </Col>
          )}
          <Col>
            <Select
              style={{ width: 120 }}
              placeholder="Filtrer from sport"
              value={filter.sport}
              onChange={(value) => handleFilterChange("sport", value)}
            >
              <Option value="">All</Option>
              <Option value="Football">Football</Option>
              <Option value="Basket">Basket</Option>
              <Option value="Padel">Padel</Option>
              <Option value="Tennis">Tennis</Option>
            </Select>
          </Col>
          <Col>
            <Select
              style={{ width: 120 }}
              placeholder="Filter from type"
              value={filter.type}
              onChange={(value) => handleFilterChange("type", value)}
            >
              <Option value="">All</Option>
              <Option value="indoor">Indoor</Option>
              <Option value="outdoor">Outdoor</Option>
            </Select>
          </Col>
          <Col>
            <Button
              style={{ color: "#ffffff" }}
              type="primary"
              ghost
              onClick={handleResetFilter}
            >
              Reset Filters
            </Button>
          </Col>
        </Row>

        <List
          style={{ marginTop: "20px" }}
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
          dataSource={filteredTracks}
          renderItem={(track) => (
            <List.Item>
              <TrackCard
                track={track}
                isAdmin={isAdmin}
                showModalEdit={showModalEdit}
                deleteTrack={deleteTrack}
              />
            </List.Item>
          )}
        />
        {openEdit && (
          <TrackForm
            title="Edit Track"
            initialValues={editTrackData}
            openModal={openEdit}
            onOk={editTrack}
            onCancel={closeModalEdit}
          />
        )}
      </div>
    </div>
  );
};

export default Home;
