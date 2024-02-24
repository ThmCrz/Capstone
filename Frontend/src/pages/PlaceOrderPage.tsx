import { useContext, useEffect } from "react"
import { Row, Col, Card, ListGroup, Button } from "react-bootstrap"
import { Helmet } from "react-helmet-async"
import { useNavigate, Link } from "react-router-dom"
import { toast } from "react-toastify"
import { Store } from "../Store"
import LoadingBox from "../components/LoadingBox"
import { useCreateOrderMutation } from "../hooks/OrderHooks"
import { ApiError } from "../types/ApiError"
import { getError } from "../types/Utils"
import CheckoutGuide from "../components/CheckOutGuide"
import { useCartClearMutation } from "../hooks/UserHooks"
import { useDeductQuantityFromOrderMutation } from "../hooks/ProductHooks"
import useEmail from "../hooks/NodeMailerHook"


export default function PlaceOrderPage() {
    const navigate = useNavigate()

    const { state, dispatch } = useContext(Store)
    const { cart, userInfo } = state

    const round2 = (num: number) => Math.round(num * 100 + Number.EPSILON) / 100 // 123.2345 => 123.23
    const totalPrices = cart.cartItems.reduce((a, c) => a + c.quantity * c.price, 0);
    cart.itemsPrice = round2(
      totalPrices - cart.taxPrice
)
cart.shippingPrice = cart.itemsPrice > 100 ? round2(0) : round2(0)
cart.taxPrice = round2(0.15 * cart.itemsPrice)
cart.totalPrice = totalPrices

    const { mutateAsync: createOrder, isLoading } = useCreateOrderMutation()
    const { mutateAsync: updateProductCountInStock } = useDeductQuantityFromOrderMutation()
    const { sendEmail, loading} = useEmail();

    const { mutateAsync: clearCart } = useCartClearMutation();

    const handleSendEmail = async () => {
      try {
        // Extract order items from cart
        const orderItemsText = cart.cartItems.map(item => (
          `Product ID: ${item._id} 
           Product: ${item.name} | Quantity: ${item.quantity}| Price: $${item.price.toFixed(2)}\n`
        )).join('\n');
    
        // Build email content
        const emailContent = `Thank you for your order with Three C Enterprises! We are delighted to serve you.
    
    Order Details:
    ${orderItemsText}
    
    Account Information:
    Username: ${userInfo.name}
    Email: ${userInfo.email}
    
    Next Steps:
    - You can track your order status in your account.
    - Feel free to contact us if you have any questions about your order.
    
    Thank you again for choosing Three C Enterprises. We appreciate your business!
    
    Best Regards,
    Three C Enterprises`;
    
        // Send the email
        await sendEmail({
          to: userInfo.email,
          subject: 'Three C Enterprises - Order Confirmation',
          text: emailContent,
        });
    
        // Show success message
        if(!loading){
          toast.success("We have sent an order confirmation email. Please check your email address.");
        }
      } catch (err) {
        // Handle errors
        toast.error('Failed to send order confirmation email.');
        console.error('Error sending order confirmation email:', err);
      }
    };
    

    const placeOrderHandler = async () => {
      try {
        const data = await createOrder({
          orderItems: cart.cartItems,
          shippingAddress: cart.shippingAddress,
          paymentMethod: cart.paymentMethod,
          itemsPrice: cart.itemsPrice,
          shippingPrice: cart.shippingPrice,
          taxPrice: cart.taxPrice,
          totalPrice: cart.totalPrice,
          phone: userInfo.phone});
        await updateProductCountInStock({orderItems: cart.cartItems});
        await clearCart({user: userInfo._id,});
        dispatch({ type: 'CART_CLEAR' })
        localStorage.removeItem('cartItems')
        navigate(`/order/${data.order._id}`)
        handleSendEmail()
      } catch (err) {
        toast.error(getError(err as ApiError))
      }

      
    }

    useEffect(() => {
      if (!cart.paymentMethod) {
        navigate('/payment')
      }
    }, [cart, navigate])

    return (
      <div>
        <CheckoutGuide step1 step2 step3 step4></CheckoutGuide>
        <Helmet>
          <title>Preview Order</title>
        </Helmet>
        <h1 className="my-3">Preview Order</h1>
        <Row>
          <Col md={8}>
            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Shipping</Card.Title>
                <Card.Text>
                  <strong>Name:</strong> {cart.shippingAddress.fullName} <br />
                  <strong>Address: </strong> {cart.shippingAddress.address},{" "}
                  {cart.shippingAddress.city},{" "}{cart.shippingAddress.postalCode},{" "} 
                  {cart.shippingAddress.country}
                </Card.Text>
                <Link to="/shipping">Edit</Link>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Payment</Card.Title>
                <Card.Text>
                  <strong>Method:</strong> {cart.paymentMethod}
                </Card.Text>
                <Link to="/payment">Edit</Link>
              </Card.Body>
            </Card>

            <Card className="mb-3">
              <Card.Body>
                <Card.Title>Items</Card.Title>
                <Row className="align-items-center">
                        <Col md={1} className="Bold">{''}</Col>
                        <Col md={5} className="Bold">{'Item'}</Col>
                        <Col md={3} className="Bold">{'Qty'}</Col>
                        <Col md={2} className="Bold">{'Price'}</Col>
                      </Row>
                <ListGroup variant="flush">
                  {cart.cartItems.map((item) => (
                    <ListGroup.Item key={item._id}>
                      <Row className="align-items-center">
                        <Col md={6}>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="img-fluid rounded thumbnail order-image"
                          ></img>{' '}
                          <Link to={`/product/${item.slug}`}>{item.name}</Link>
                        </Col>
                        <Col md={3}>
                          <span>{item.quantity}</span>
                        </Col>
                        <Col md={2}>₱{item.price}</Col>
                      </Row>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
                <Link to="/cart">Edit</Link>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card>
              <Card.Body>
                <Card.Title>Order Summary</Card.Title>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Items</Col>
                      <Col>₱{cart.itemsPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping</Col>
                      <Col>₱{cart.shippingPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tax</Col>
                      <Col>₱{cart.taxPrice.toFixed(2)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <strong> Order Total</strong>
                      </Col>
                      <Col>
                        <strong>₱{cart.totalPrice.toFixed(2)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <div className="d-grid">
                      <Button
                        type="button"
                        onClick={placeOrderHandler}
                        disabled={cart.cartItems.length === 0 || isLoading}
                      >
                        Place Order
                      </Button>
                    </div>
                    {isLoading && <LoadingBox></LoadingBox>}
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
