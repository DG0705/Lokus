import { OrderTrackingClient } from '@/app/components/delivery/OrderTrackingClient';

export default async function OrderTrackingPage(props: PageProps<'/account/orders/[orderId]/track'>) {
  const { orderId } = await props.params;
  return <OrderTrackingClient orderId={orderId} />;
}
