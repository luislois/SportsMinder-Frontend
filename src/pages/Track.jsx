import { useEffect, useState } from 'react';
import { DatePicker, Table, Row, Col, Typography, Tag, App as AntdApp } from 'antd';
import dayjs from 'dayjs';
import { useParams} from 'react-router-dom';
import Header from '../components/Header';
import { renderTagForSport, srcTrackImage } from '../utils/Utils';
import { useAuth0 } from '@auth0/auth0-react';

const Track = () => {
  const { modal, notification } = AntdApp.useApp();
  const { user } = useAuth0();
  const { trackId } = useParams();
  const [track, setTrack] = useState();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [bookings, setBookings] = useState([]);
  const [datePickerStatus, setDatePickerStatus] = useState('default');
  const currentDate = dayjs().format('YYYY-MM-DD');
  const maxDatePicker = dayjs().add(30, 'days');
  const currentHourMinusOne = dayjs().add(-1, 'hour').format('HH:mm');
  const startHourList = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];
  const endHourList = ['01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00'
  ];
  const disabledDate = (current) => {
    const minDate = dayjs().subtract(1, 'days');
    return current < minDate;
  };

  useEffect(() => {
    // Realizar la llamada a la API para obtener los datos de la pista usando el ID
    const fetchData = async () => {
      const dataTrack = await fetch(`https://accurate-happiness-production.up.railway.app/api/tracks/${trackId}`);
      const trackData = await dataTrack.json();
      setTrack(trackData);
    };
    fetchData();
}, [trackId]);

  useEffect(() => {
    // Realizar la llamada a la API para obtener los datos de las reservas usando el ID de la pista y la fecha del date picker
    const fetchData = async () => {
      if(selectedDate){
        const formattedDate = selectedDate.format('YYYY-MM-DD');
        const dataBookings = await fetch(`https://accurate-happiness-production.up.railway.app/api/bookings/track/${trackId}/date/${formattedDate}`);
        const bookingsData = await dataBookings.json();
        setBookings(bookingsData);
      }
    };
    fetchData();
  }, [trackId, selectedDate]);

  
  
  const handleDateChange = (date) => {
    setSelectedDate(date)
    if (date) {
      setDatePickerStatus('default');
    } else {
      setDatePickerStatus('warning');
    }
  };

  const handleReserve = (date, startHour, endHour) => {
    modal.confirm({
      title: `Are you sure you want to reserve on ${date}, \n Start time: ${startHour}, end time: ${endHour}?`,
      content: 'We redirect you to the payment page.',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk(){
        const formattedDate = dayjs(date, 'ddd, DD MMM YYYY').format('YYYY-MM-DD'); 
        const bookingGeneratedId = `${trackId}-${formattedDate}-${startHour}`;
        try {
          const bookingData = {
            bookingId: bookingGeneratedId,
            track: {
              id: track.id,
              name: track.name,
              sport: track.sport,
              type: track.type
            },
            idUser: user.dni,
            date: formattedDate,
            startHour: startHour,
            endHour: endHour
          };

        const response = await fetch('https://accurate-happiness-production.up.railway.app/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            notification.open({
              placement: "top",
              type: 'error',
              title: 'ERROR',
              message: `Booking can not made on: ${date}`,
              description: `Start time: ${startHour}, End time: ${endHour}.\n Erro: ${response.error}`,
              duration: 3,
          });
          
        } else {
            const newBooking = await response.json();
            // I update the status of the reserves with the new
            setBookings([...bookings, newBooking]);
              notification.open({
                placement: "top",
                type: 'success',
                title: 'SUCCESS',
                message: `Payment Recived, booking made on: ${date}`,
                description: `Start time: ${startHour}, End time: ${endHour}.`,
                duration: 3,
              });
        }
      } catch (error) {
        notification.open({
          placement: "top",
          type: 'error',
          title: 'ERROR',
          message: `You have to log in first.`,
          duration: 3,
        });
      }
    }})
};

const columns = [
  {
    title: 'Date',
    dataIndex: 'date',
    key: 'date',
    width: 150
  },
  {
    title: 'Hour Start',
    dataIndex: 'startHour',
    key: 'startHour',
    align: 'center',
    width: 150
  },
  {
    title: 'Hour End',
    dataIndex: 'endHour',
    key: 'endHour',
    align: 'center',
    width: 150
  },
  {
    title: 'Status',
    width: 150,
    align: 'center',
    render: (item) => {
      // Formateo para tener el mismo formato que en la base de datos
      const formattedItemDate = dayjs(item.date, 'ddd, DD MMM YYYY').format('YYYY-MM-DD');
      const formattedItemStartHour = dayjs(item.startHour, 'HH:mm').format('HH:mm:ss');

      const isBooked = bookings.some(booking => booking.date === formattedItemDate && booking.startHour === formattedItemStartHour);
      const isUnavailable = formattedItemDate === currentDate &&  item.startHour < currentHourMinusOne;

      let reserveLink;
      if (isUnavailable) {
        reserveLink = <span style={{ color: 'gray' }}>Unavailable</span>;
      } else if (isBooked) {
        reserveLink = <span style={{ color: 'red' }}>Reserved</span>;
      } else {
        reserveLink = (
          <Typography.Link onClick={() => handleReserve(item.date, item.startHour, item.endHour)}>
            Reserve
          </Typography.Link>
        );
      }
      return reserveLink;
    },
  }
];
  const dataSource = selectedDate ? startHourList.map((startHour, index) => ({
    key: index,
    date: selectedDate.format("ddd, DD MMM YYYY"), 
    startHour,
    endHour: endHourList[index],
  })) : [];

  return (
      <div className='page-container'>
        <Header/>

        <div style={{ marginTop: 20}}>
          {track && (
            <>
              <img src={srcTrackImage(track.sport, track.type)} alt="track Image" />
              <Row style= {{marginTop: '20px'}}>
                <Col>
                  <h1>{ track.name }</h1>
                </Col>
              </Row>
              
              {renderTagForSport(track.sport)}
              <Tag color={track.type === 'outdoor' ? 'cyan' : 'purple'}>
                {track.type.toUpperCase()}
              </Tag>
              
            </>
          )}
        </div>
        <div>

          <Row style= {{marginTop: '20px'}} gutter={[16, 16]} justify="start">
            <Col>
              <DatePicker 
              onChange={handleDateChange} 
              disabledDate={disabledDate}
              status = {datePickerStatus}
              format={'ddd, DD MMM YYYY'}
              defaultValue={selectedDate}
              maxDate={maxDatePicker}
              />
            </Col>
          </Row>

          <Table
            style={{ marginTop:20 }}
            pagination = {{ pageSize: 8 }}
            dataSource={dataSource}
            columns={columns}
            title={() => <h2>Bookings</h2>}
            />
        </div>
    </div>
  );
};

export default Track;