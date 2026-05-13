import { ProductForm } from '../product-form'

export const metadata = { title: 'محصول جدید' }

export default function NewProductPage() {
  return <ProductForm mode="create" />
}
