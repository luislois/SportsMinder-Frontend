import { Modal, Form, Input, Select, Row, Col } from "antd";

const { Option } = Select;

const TrackForm = ({ title, initialValues, openModal, onOk, onCancel }) => {
  const [form] = Form.useForm();

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i + 1;
    const formattedHour = `${hour < 10 ? "0" + hour : hour}:00`;
    return formattedHour;
  });

  return (
    <Modal
      title={title}
      okText="Save"
      open={openModal}
      onOk={() => onOk(form)}
      onCancel={onCancel}
    >
      <Form form={form} layout="vertical" initialValues={initialValues}>
        <Form.Item
          name="name"
          label="Name"
          rules={[
            { required: true, message: "Please enter the name of the track" },
            { max: 50, message: "Name cannot exceed 50 characters" },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="sport"
          label="Sport"
          rules={[{ required: true, message: "Please select the sport" }]}
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
          rules={[{ required: true, message: "Please select the type" }]}
        >
          <Select>
            <Option value="indoor">Indoor</Option>
            <Option value="outdoor">Outdoor</Option>
          </Select>
        </Form.Item>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startHour"
              label="Start Hour"
              rules={[
                { required: true, message: "Please select the start hour" },
              ]}
            >
              <Select>
                {hours.map((hour) => (
                  <Option key={hour}>{hour}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endHour"
              label="End Hour"
              rules={[
                { required: true, message: "Please select the end hour" },
              ]}
            >
              <Select>
                {hours.map((hour) => (
                  <Option key={hour}>{hour}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default TrackForm;
