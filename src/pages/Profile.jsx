import { useEffect, useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  Descriptions,
  Table,
  Tag,
  Typography,
  Spin,
  App as AntdApp,
} from "antd";
import dayjs from "dayjs";
import { Link } from "react-router-dom";
import { renderTagForSport, renderTagForType } from "../utils/Utils";
import ApiService from "../utils/ApiService";

const Profile = () => {
  const { modal, notification } = AntdApp.useApp();
  const { user } = useAuth0();
  const { name, last_name, _phone_number, dni, email } = user || [];
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleResetPassword = () => {
    modal.confirm({
      title: "Are you sure you want reset the password?",
      content: "This action can not be undone.",
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        const response = await fetch(
          "http://dev-fhvg4rnmgf8fdbv6.us.auth0.com/dbconnections/change_password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              client_id: "uTkH5t8G9WuR4ONgBtIWAIiNYeYmhlIy",
              email: user.email,
              connection: "Username-Password-Authentication",
            }),
          }
        );
        if (response.ok) {
          notification.open({
            placement: "top",
            type: "success",
            title: "SUCCESS",
            message: `Email to change your password sending succesfully`,
            duration: 3,
          });
        } else {
          notification.open({
            placement: "top",
            type: "error",
            title: "Error",
            message: "Failed to send you a email",
            duration: 3,
          });
        }
      },
    });
  };

  const items = [
    {
      key: "1",
      label: "First Name",
      children: name,
    },
    {
      key: "2",
      label: "Last Name",
      children: last_name,
    },
    {
      key: "3",
      label: "Phone number",
      children: _phone_number,
    },
    {
      key: "4",
      label: "Dni",
      children: dni,
    },
    {
      key: "5",
      label: "Email",
      children: email,
    },
    {
      key: "6",
      label: "Password",
      children: <a onClick={handleResetPassword}>Reset Password</a>,
    },
  ];

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, booking) => (
        <Link to={`/tracks/${booking.track_id}`}>{text}</Link>
      ),
    },
    {
      title: "Sport",
      dataIndex: "sport",
      key: "sport",
      filters: [
        { text: "Basket", value: "Basket" },
        { text: "Football", value: "Football" },
        { text: "Padel", value: "Padel" },
        { text: "Tennis", value: "Tennis" },
      ],

      onFilter: (value, record) => record.sport === value,
      render: (text) => renderTagForSport(text),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      filters: [
        { text: "Outdoor", value: "outdoor" },
        { text: "Indoor", value: "indoor" },
      ],
      onFilter: (value, record) => record.type === value,
      render: (text) => renderTagForType(text),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      defaultSortOrder: "descend",
      sortDirections: ["ascend", "descend", "ascend"],
      render: (item) => dayjs(item, "YYYY-MM-DD").format("ddd, DD MMM YYYY"),
      sorter: (a, b) => {
        const dateComparison =
          dayjs(a.date).valueOf() - dayjs(b.date).valueOf();
        if (dateComparison === 0) {
          // If dates are equal, compare start hours
          return (
            dayjs(a.startHour, "HH:mm").valueOf() -
            dayjs(b.startHour, "HH:mm").valueOf()
          );
        }
        return dateComparison;
      },
    },
    {
      title: "Start Hour",
      dataIndex: "startHour",
      key: "startHour",
      render: (item) => dayjs(item, "HH:mm:ss").format("HH:mm"),
    },
    {
      title: "End Hour",
      dataIndex: "endHour",
      key: "endHour",
      render: (item) => dayjs(item, "HH:mm:ss").format("HH:mm"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Reserved", value: "reserved" },
        { text: "Expired", value: "expired" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text) => {
        let color = text === "reserved" ? "success" : "default";
        return (
          <Tag
            color={color}
            key={text}
            style={{ minWidth: "70px", textAlign: "center" }}
          >
            {text.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      key: "action",
      render: (item) => {
        const isReserved = item.status === "reserved";
        if (isReserved) {
          return (
            <Typography.Link
              style={{ color: "red" }}
              onClick={() => handleDeleteReserve(item)}
            >
              Delete
            </Typography.Link>
          );
        }
      },
    },
  ];
  const handleDeleteReserve = (booking) => {
    const formattedStartHour = dayjs(booking.startHour, "HH:mm:ss").format(
      "HH:mm"
    );
    const bookingGeneratedId = `${booking.track_id}-${booking.date}-${formattedStartHour}`;
    const maxDay = dayjs().add(2, "day").format("YYYY-MM-DD");
    const bookingPlusDays = dayjs(booking.date)
      .add(-2, "day")
      .format("YYYY-MM-DD");
    const content =
      bookingPlusDays <= maxDay
        ? "You do not recieve a refund."
        : "You will recieve a refund in a few days.";

    modal.confirm({
      title: "Are you sure you want delete this reserve?",
      content: content,
      okText: "Yes",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        const response = await ApiService.deleteBooking(bookingGeneratedId);
        if (response === 204) {
          notification.open({
            placement: "top",
            type: "success",
            title: "SUCCESS",
            message: `Booking delete succesfully`,
            duration: 3,
          });
          setBookings((prevBookings) =>
            prevBookings.filter((b) => b.bookingId !== booking.bookingId)
          );
        } else {
          notification.open({
            placement: "top",
            type: "error",
            title: "Error",
            message: "Failed to delete booking",
            duration: 3,
          });
        }
      },
    });
  };

  const fetchData = useCallback(async () => {
    if (user) {
      try {
        const bookingsData = await ApiService.getBookingsByUserId(user.dni);
        const mappedBookings = bookingsData.map((booking, index) => ({
          key: index,
          bookingId: booking.id,
          track_id: booking.track.id,
          name: booking.track.name,
          sport: booking.track.sport,
          type: booking.track.type,
          date: booking.date,
          startHour: booking.startHour,
          endHour: booking.endHour,
          status: booking.status,
        }));
        setBookings(mappedBookings);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      {loading ? (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <Descriptions
            title={<h2>User Info</h2>}
            size="default"
            items={items}
          />
          <Table
            dataSource={bookings}
            columns={columns}
            rowKey="key"
            title={() => <h2>Bookings</h2>}
          />
        </div>
      )}
    </div>
  );
};

export default Profile;
