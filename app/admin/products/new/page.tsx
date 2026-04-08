import { ProductForm } from '@/app/admin/components/ProductForm';

const initialValues = {
  name: '',
  price: '',
  description: '',
  sizes: '',
  colors: '',
  image_url: '',
  brand: '',
  gender: '',
  category: '',
  badge: '',
  is_featured: false,
  gallery_urls: '',
};

export default function NewProductPage() {
  return (
    <ProductForm
      title="Add product"
      submitLabel="Create product"
      initialValues={initialValues}
      mode="create"
    />
  );
}
