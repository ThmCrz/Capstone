import LoadingBox from "../components/LoadingBox";
import MessageBox from "../components/MessageBox";
import { ApiError } from "../types/ApiError";
import { getError } from "../types/Utils";
import { useGetOrdersQuery } from "../hooks/OrderHooks";
import OrdersCard from "../components/OrderCard";
import { Badge, Card, Col, Row } from "react-bootstrap";
import { Helmet } from "react-helmet-async";
import { useState } from "react";


export default function OrdersManagementPage() {

    const { data: orders, isLoading, error } = useGetOrdersQuery();

    const [ orderStatus, setOrderStatus ] = useState(1);

    if (!orders) {
        return null; // Render an empty element when orders is undefined
      }



    return (
      <Row>
        <Col md={3}>
          <Card className="border-0">
            <Card.Body>
              <Card.Title>
                <div className="mb-2">Orders Management Menu:</div>
                
              </Card.Title>
              {/* Add admin's info here */}
            </Card.Body>

            <ul className="list-group list-group-flush">
              {/* Sidebar menu items */}
             
              <li className={`list-group-item Sidebar-menu ${orderStatus === 1 ? 'active' : ''}`} onClick={() => {setOrderStatus(1)}}><Badge pill bg="danger">{orders.filter(order => order.status === 1).length}</Badge> Unconfirmed Orders</li>
              <li className={`list-group-item Sidebar-menu ${orderStatus === 2 ? 'active' : ''}`} onClick={() => {setOrderStatus(2)}}><Badge pill bg="danger">{orders.filter(order => order.status === 2).length}</Badge> Confirmed Orders</li>
              <li className={`list-group-item Sidebar-menu ${orderStatus === 3 ? 'active' : ''}`} onClick={() => {setOrderStatus(3)}}><Badge pill bg="danger">{orders.filter(order => order.status === 3).length}</Badge> Prepared Orders </li>
              <li className={`list-group-item Sidebar-menu ${orderStatus === 4 ? 'active' : ''}`} onClick={() => {setOrderStatus(4)}}><Badge pill bg="danger">{orders.filter(order => order.status === 4).length}</Badge> Out for Delivery Orders </li>
              <li className={`list-group-item Sidebar-menu ${orderStatus === 5 ? 'active' : ''}`} onClick={() => {setOrderStatus(5)}}><Badge pill bg="danger">{orders.filter(order => order.status === 5).length}</Badge> Completed Orders </li>
              <li className={`list-group-item Sidebar-menu ${orderStatus === -1 ? 'active' : ''}`} onClick={() => {setOrderStatus(-1)}}><Badge pill bg="danger">{orders.filter(order => order.status === -1).length}</Badge> Cancelled Orders </li>
              {/* Add more menu items for other pages */}
            </ul>
          </Card>
        </Col>

        <Col>
          <div>
            <Helmet>
              <title>Orders Management Dashboard</title>
            </Helmet>
            <h1>Orders Management Dashboard</h1>
            {isLoading ? (
              <LoadingBox />
            ) : error ? (
              <MessageBox variant="danger">
                {getError(error as ApiError)}
              </MessageBox>
            ) : (
              <div>
                  <Col className="equal-height-column">
                    <OrdersCard
                      status={orderStatus}
                      orders={orders.filter((order) => order.status === orderStatus)}
                    />
                  </Col> 
              </div>
            )}
          </div>
        </Col>
      </Row>
    );
    }

