import { useState, useEffect } from "react";
import { List, Col, Row, Select, Button, Spin, App as AntdApp } from "antd";
import { useAuth0 } from "@auth0/auth0-react";
import TrackForm from "../components/Form";
import "../styles.css";
import TrackCard from "../components/TrackCard";
import ApiService from "../utils/ApiService";
const { Option } = Select;

const Home = () => {
  const { modal, notification } = AntdApp.useApp();
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [filter, setFilter] = useState({ sport: "", type: "" });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTrackData, setEditTrackData] = useState(null);
  const { user } = useAuth0();
  const [loading, setLoading] = useState(true);

  const userRoles = user ? user["_roles"] : "Loading...";
  const isAdmin = userRoles && userRoles.includes("Admin");
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await ApiService.getAllTracks();
        setTracks(response);
      } catch (error) {
      } finally {
        setLoading(false);
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
    setOpenEdit(false);
  };

  const showModalEdit = (track) => {
    setEditTrackData(track);
    setOpenEdit(true);
  };

  const addTrack = async (form) => {
    try {
      const trackData = await form.validateFields();
      const newTrack = await ApiService.addTrack(trackData);
      setTracks((prevTracks) => [...prevTracks, newTrack]);
      form.resetFields();

      notification.open({
        placement: "top",
        type: "success",
        title: "SUCCESS",
        message: "Track added successfully.",
        duration: 2,
      });

      setTimeout(() => {
        closeModalAdd();
      }, 100);
    } catch (error) {
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
          const response = await ApiService.deleteTrack(trackId);
          if (response === 204) {
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
    console.log("Track data: " + trackData.lat);
    modal.confirm({
      title: "Are you sure you want edit this track?",
      content: "This action can not be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        const response = await ApiService.editTrack(
          editTrackData.id,
          trackData
        );
        if (response.status === 200) {
          const editedTrackIndex = tracks.findIndex(
            (track) => track.id === editTrackData.id
          );
          const updatedTracks = [...tracks];
          updatedTracks[editedTrackIndex] = {
            ...updatedTracks[editedTrackIndex],
            ...response.data,
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
          }, 500);
        } else {
          notification.open({
            placement: "top",
            type: "error",
            title: "Error",
            message: "Failed to edit track",
            duration: 3,
          });
          setTimeout(() => {
            form.resetFields();
            closeModalEdit();
          }, 500);
        }
      },
    });
  };

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" /> {/* Display spinner while loading */}
        </div>
      ) : (
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
                placeholder="Filter by sport"
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
                placeholder="Filter by type"
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
      )}
    </div>
  );
};

export default Home;
