import { useEffect, useState } from "react";
import {
  DatePicker,
  Table,
  Row,
  Col,
  Typography,
  Tag,
  Spin,
  App as AntdApp,
} from "antd";
import dayjs from "dayjs";
import { useParams } from "react-router-dom";
import Map from "../components/Map";
import { renderTagForSport, srcTrackImage } from "../utils/Utils";
import { useAuth0 } from "@auth0/auth0-react";
import ApiService from "../utils/ApiService";
import PayPalButton from "../components/PaypalButton";

const Track = () => {
  const { modal, notification } = AntdApp.useApp();
  const { user } = useAuth0();
  const { trackId } = useParams();
  const [track, setTrack] = useState();
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [bookings, setBookings] = useState([]);
  const [datePickerStatus, setDatePickerStatus] = useState("default");
  const currentDate = dayjs().format("YYYY-MM-DD");
  const maxDatePicker = dayjs().add(30, "days");
  const currentHourMinusOne = dayjs().add(-1, "hour").format("HH:mm");
  const [loading, setLoading] = useState(true);

  const generateHoursList = (startHour, endHour) => {
    let hoursList = [];
    let currentHour = startHour;

    while (currentHour.isBefore(endHour)) {
      hoursList.push(currentHour.format("HH:mm"));
      currentHour = currentHour.add(1, "hour");
    }

    return hoursList;
  };

  const disabledDate = (current) => {
    const minDate = dayjs().subtract(1, "days");
    return current < minDate;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const trackData = await ApiService.getTrack(trackId);
        setTrack(trackData);
      } catch (error) {
        console.error("Failed to fetch track data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [trackId]);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedDate) {
        const formattedDate = selectedDate.format("YYYY-MM-DD");
        const bookingsData = await ApiService.getBookingsByTrackIdAndDate(
          trackId,
          formattedDate
        );
        setBookings(bookingsData);
      }
    };
    fetchData();
  }, [trackId, selectedDate]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      setDatePickerStatus("default");
    } else {
      setDatePickerStatus("warning");
    }
  };

  const handleReserve = (date, startHour, endHour) => {
    modal.confirm({
      title: `Are you sure you want to reserve on ${date}, \n Start time: ${startHour}, end time: ${endHour}?`,
      content: "We redirect you to the payment page.",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        const formattedDate = dayjs(date, "ddd, DD MMM YYYY").format(
          "YYYY-MM-DD"
        );
        const bookingGeneratedId = `${trackId}-${formattedDate}-${startHour}`;
        try {
          const bookingData = {
            bookingId: bookingGeneratedId,
            track: {
              id: track.id,
              name: track.name,
              sport: track.sport,
              type: track.type,
            },
            idUser: user.dni,
            date: formattedDate,
            startHour: startHour,
            endHour: endHour,
          };

          const response = await ApiService.postBooking(bookingData);
          if (response.status != 201) {
            notification.open({
              placement: "top",
              type: "error",
              title: "ERROR",
              message: `Booking can not made on: ${date}`,
              description: `Start time: ${startHour}, End time: ${endHour}.\n Error: ${response.error}`,
              duration: 3,
            });
          } else {
            const newBooking = response.data;
            // I update the status of the reserves with the new
            setBookings([...bookings, newBooking]);
            notification.open({
              placement: "top",
              type: "success",
              title: "SUCCESS",
              message: `Payment Recived, booking made on: ${date}`,
              description: `Start time: ${startHour}, End time: ${endHour}.`,
              duration: 3,
            });
          }
        } catch (error) {}
      },
    });
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 150,
    },
    {
      title: "Hour Start",
      dataIndex: "startHour",
      key: "startHour",
      align: "center",
      width: 150,
    },
    {
      title: "Hour End",
      dataIndex: "endHour",
      key: "endHour",
      align: "center",
      width: 150,
    },
    {
      title: "Status",
      width: 150,
      align: "center",
      render: (item) => {
        // Formateo para tener el mismo formato que en la base de datos
        const formattedItemDate = dayjs(item.date, "ddd, DD MMM YYYY").format(
          "YYYY-MM-DD"
        );
        const formattedItemStartHour = dayjs(item.startHour, "HH:mm").format(
          "HH:mm:ss"
        );

        const isBooked = bookings.some(
          (booking) =>
            booking.date === formattedItemDate &&
            booking.startHour === formattedItemStartHour
        );
        const isUnavailable =
          formattedItemDate === currentDate &&
          item.startHour < currentHourMinusOne;

        let reserveLink;
        if (isUnavailable) {
          reserveLink = <span style={{ color: "gray" }}>Unavailable</span>;
        } else if (isBooked) {
          reserveLink = <span style={{ color: "red" }}>Reserved</span>;
        } else {
          reserveLink = (
            <Typography.Link
              onClick={() =>
                handleReserve(item.date, item.startHour, item.endHour)
              }
            >
              Reserve
            </Typography.Link>
          );
        }
        return reserveLink;
      },
    },
  ];

  const startHourList = track
    ? generateHoursList(
        dayjs(track.startHour, "HH:mm"),
        dayjs(track.endHour, "HH:mm")
      )
    : [];
  const endHourList = track
    ? startHourList.map((hour) =>
        dayjs(hour, "HH:mm").add(1, "hour").format("HH:mm")
      )
    : [];

  const dataSource = selectedDate
    ? startHourList.map((startHour, index) => ({
        key: index,
        date: selectedDate.format("ddd, DD MMM YYYY"),
        startHour,
        endHour: endHourList[index],
      }))
    : [];

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <div style={{ marginTop: 20 }}>
            {track && (
              <>
                <img
                  src={srcTrackImage(track.sport, track.type)}
                  alt="track Image"
                />
                <Row style={{ marginTop: "20px" }}>
                  <Col>
                    <h1>{track.name}</h1>
                  </Col>
                </Row>

                {renderTagForSport(track.sport)}
                <Tag color={track.type === "outdoor" ? "cyan" : "purple"}>
                  {track.type.toUpperCase()}
                </Tag>
              </>
            )}
          </div>
          <div>
            <Row
              style={{ marginTop: "20px" }}
              gutter={[16, 16]}
              justify="start"
            >
              <Col>
                <DatePicker
                  onChange={handleDateChange}
                  disabledDate={disabledDate}
                  status={datePickerStatus}
                  format={"ddd, DD MMM YYYY"}
                  defaultValue={selectedDate}
                  maxDate={maxDatePicker}
                />
              </Col>
            </Row>

            <Table
              style={{ marginTop: 20 }}
              pagination={{ pageSize: 8 }}
              dataSource={dataSource}
              columns={columns}
              title={() => <h2>Bookings</h2>}
            />
          </div>
          <Map trackName={track.name} lat={track.lat} lng={track.lng}></Map>
        </>
      )}
    </div>
  );
};

export default Track;
