import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { srcTrackImage, renderTagForSport, renderTagForType  } from '../utils/Utils';
import { Card, List, Col, Row, Select, Button, Modal, Form, Input, App as AntdApp } from "antd";
import { Link } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import '../styles.css';

const { Option } = Select;

const Home = () => {
  const { modal, notification } = AntdApp.useApp();
  const [tracks, setTracks] = useState([]);
  const [filteredTracks, setFilteredTracks] = useState([]);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [filter, setFilter] = useState({ sport: '', type: '' });
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editTrackData, setEditTrackData] = useState(null);
  const [form] = Form.useForm();
  const { user } = useAuth0();
  
  const userRoles = user ? user['_roles'] : 'Loading...';
  const isAdmin = userRoles && userRoles.includes('Admin');
  
    useEffect(() => {
      const fetchData = async () => {
        try {
          const data = await fetch('https://accurate-happiness-production.up.railway.app/api/tracks');
          const tracksData = await data.json();
          setTracks(tracksData);
        } catch (error) {
          console.error('Error fetching data from the API:', error);
        }
      };
      fetchData();
    },[]);


  const handleFilterChange = (key, value) => {
    setFilter({ ...filter, [key]: value });
  };

  useEffect(() => {
    // Filter tracks based on user selection
    let filteredTracksResult = tracks;
    if (filter.sport) {
      filteredTracksResult = filteredTracksResult.filter(track => track.sport === filter.sport);
    }
    if (filter.type) {
      filteredTracksResult = filteredTracksResult.filter(track => track.type === filter.type);
    }
    setFilteredTracks(filteredTracksResult);
  }, [filter, tracks]);
  
  const handleResetFilter = () => {
    setFilter({ sport: '', type: '' });
  };

  const closeModalAdd = () => {
    form.resetFields();
    setOpenAdd(false);
  };

  const showModalAdd = () => {
    setOpenAdd(true);
  };
  const closeModalEdit = () => {
    form.resetFields();
    setOpenEdit(false);
  };

  const showModalEdit = (track) => {
    setEditTrackData(track)
    setOpenEdit(true);
  };

  useEffect(() => {
  if (editTrackData) {
    form.setFieldsValue(editTrackData);
  }
}, [editTrackData, form]);

  const addTrack = async () => {
    setConfirmLoading(true);
    try {
      const values = await form.validateFields();
      const trackData = values;

      const response = await fetch('https://accurate-happiness-production.up.railway.app/api/tracks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(trackData)
      });

      if (!response.ok) {
        throw new Error('Track could not be added');
      }

      const newTrack = await response.json();
      // Update the state of tracks with the new track
      setTracks(prevTracks => [...prevTracks, newTrack]);
      
      notification.open({
        placement: "top",
        type: 'success',
        title: 'SUCCESS',
        message: 'Track added successfully.',
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
    console.error('Error adding track:', error);
    notification.open({
      placement: "top",
      type: 'error',
      title: 'ERROR',
      message: 'Track could not be added.',
      duration: 3,
    });
  }
  };

  const deleteTrack = async (trackId) => {
    modal.confirm({
        title: 'Are you sure you want delete this track?',
        content: 'This action can not be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'Cancel',
        async onOk(){
          try{
              const response = await fetch(`https://accurate-happiness-production.up.railway.app/api/tracks/${trackId}`, {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json'
                },
              });
              if(response.ok){
                notification.open({
                  placement: "top",
                  type: 'success',
                  title: 'SUCCESS',
                  message: `Track delete succesfully`,
                  duration: 3,
                });
                setTracks(tracks.filter(track => track.id !== trackId));
              } 
            } catch (error) {
              console.error('Error deleting track:', error);
                notification.open({
                  placement: "top",
                  type: 'error',
                  title: 'Error',
                  message: 'Failed to delete track',
                  duration: 3,
                });
            }
        },
      })
  };

  const editTrack = async () => {
    const values = await form.validateFields();
    const trackData = values;
    modal.confirm({
        title: 'Are you sure you want edit this track?',
        content: 'This action can not be undone.',
        okText: 'Yes',
        okType: 'danger',
        cancelText: 'Cancel',
        async onOk(){
          setConfirmLoading(true);

          const response = await fetch(`https://accurate-happiness-production.up.railway.app/api/tracks/${editTrackData.id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(trackData),
          });
          if(response.ok){
            const editedTrackIndex = tracks.findIndex(track => track.id === editTrackData.id);
            const updatedTracks = [...tracks];
            updatedTracks[editedTrackIndex] = { ...updatedTracks[editedTrackIndex], ...trackData };
            setTracks(updatedTracks);

            notification.open({
              placement: "top",
              type: 'success',
              title: 'SUCCESS',
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
              type: 'error',
              title: 'Error',
              message: 'Failed to edit track',
              duration: 3,
        });
      }
        },
      })
  };


  return (
      <div className='page-container'>
      <Header/>
      
      <div style={{ marginTop: 20 }}>
        <Modal
          title = "Edit a Track"
          okText="Edit"
          open = {openEdit}
          onOk = {editTrack}
          confirmLoading = {confirmLoading}
          onCancel= {closeModalEdit}
        >
          <Form form={form} layout="vertical" name="edit_track_form" initialValues={editTrackData}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter the name of the track' },
            { max: 50, message: 'Name cannot exceed 50 characters' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="sport"
          label="Sport"
          rules={[{ required: true, message: 'Please select the sport' }]}
        >
          <Select>
            <Option value="Football">Football</Option>
            <Option value="Basket">Basket</Option>
            <Option value="Padel">Padel</Option>
            <Option value="Tennis">Tennis</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select the type' }]}
        >
          <Select>
            <Option value="indoor">Indoor</Option>
            <Option value="outdoor">Outdoor</Option>
          </Select>
        </Form.Item>
      </Form>
        </Modal>
        <Modal
          title = "Add a Track"
          okText="Add"
          open = {openAdd}
          onOk = {addTrack}
          confirmLoading = {confirmLoading} 
          onCancel= {closeModalAdd}
        >
          <Form form={form} layout="vertical" name="add_track_form">
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: 'Please enter the name of the track' },
            { max: 50, message: 'Name cannot exceed 50 characters' }
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="sport"
          label="Sport"
          rules={[{ required: true, message: 'Please select the sport' }]}
        >
          <Select>
            <Option value="Football">Football</Option>
            <Option value="Basket">Basket</Option>
            <Option value="Padel">Padel</Option>
            <Option value="Tennis">Tennis</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="type"
          label="Type"
          rules={[{ required: true, message: 'Please select the type' }]}
        >
          <Select>
            <Option value="indoor">Indoor</Option>
            <Option value="outdoor">Outdoor</Option>
          </Select>
        </Form.Item>
      </Form>
        </Modal>
        <Row gutter={[16, 16]} justify="end">
          {isAdmin && (
            <Col>
            <Button type='primary' onClick={showModalAdd}>
              + Add Track
            </Button>
          </Col>
          )}
          <Col>
            <Select
              style={{ width: 120 }}
              placeholder="Filtrer from sport"
              value={filter.sport}
              onChange={(value) => handleFilterChange('sport', value)}
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
              onChange={(value) => handleFilterChange('type', value)}
            >
              <Option value="">All</Option>
              <Option value="indoor">Indoor</Option>
              <Option value="outdoor">Outdoor</Option>
            </Select>
          </Col>
          <Col>
            <Button style={{ color: '#ffffff' }} type="primary" ghost onClick={handleResetFilter}>Reset Filters</Button>
        </Col>
        </Row>
        
        <List
        style={{ marginTop: '20px' }}
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 4 }}
        dataSource={filteredTracks}
        renderItem={(track) => (
          <List.Item>
              <Card
                  
                  onClick={()=><Link to={`/tracks/${track.id}`}/>}
                  hoverable
                  style={{ width: '100%'}}
                  
                  cover={
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <Link to={`/tracks/${track.id}`}>
                        <img alt="track image" src={srcTrackImage(track.sport, track.type)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </Link>
                    </div>           
                }
                  actions={
              isAdmin
                ? [
                    <EditOutlined key="edit" onClick={(e) => { e.stopPropagation(); showModalEdit(track); }} />,
                    <DeleteOutlined
                      key="delete"
                      style={{ color: '#ff4d4f' }}
                      onClick={(e) => { e.stopPropagation(); deleteTrack(track.id); }}
                    />
                  ]
                : null
            }
                  >
                  <Link to={`/tracks/${track.id}`}>
                  <Card.Meta title={track.name}/>
                <Row justify="space-between">
                  <Col style={{ marginTop: 15}}>
                    {renderTagForSport(track.sport)}
                    {renderTagForType(track.type)}
                  </Col>
                </Row> 

                  </Link>
              </Card>
            
          </List.Item>
        )}
        />
        </div>
      </div>
  );
};

export default Home;
