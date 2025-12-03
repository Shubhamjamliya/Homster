# Images Folder Structure

## Organization Strategy

Images are organized by **pages** and **components** for easy maintenance and scalability.

## Folder Structure

```
assets/images/
├── pages/              # Page-specific images
│   ├── Home/          # Home page images
│   ├── ACService/     # AC Service page images
│   ├── Native/        # Native products page images
│   ├── Rewards/       # Rewards page images
│   └── Account/       # Account page images
│
├── components/        # Component-specific images
│   ├── common/        # Shared/common component images
│   ├── ACService/     # AC Service component images
│   └── Home/          # Home page component images
│
├── services/          # Service category images
│   ├── ac/            # AC service images
│   └── electrical/    # Electrical service images
│
├── products/          # Product images
│
├── testimonials/      # Testimonial/user images
│
├── icons/             # Icon images (if not using react-icons)
└── illustrations/     # Illustration images
```

## Usage Examples

### Page Images
```jsx
// In ACService page
import acServiceHero from '../../assets/images/pages/ACService/hero.jpg';
import acServiceBanner from '../../assets/images/pages/ACService/banner.jpg';
```

### Component Images
```jsx
// In ACServiceHeader component
import headerBg from '../../../assets/images/components/ACService/header-bg.jpg';
```

### Service Images
```jsx
// In service cards
import acCleaning from '../../assets/images/services/ac/cleaning.jpg';
import acRepair from '../../assets/images/services/ac/repair.jpg';
```

### Product Images
```jsx
// In product cards
import smartLock from '../../assets/images/products/smart-lock.jpg';
import roPurifier from '../../assets/images/products/ro-purifier.jpg';
```

## Naming Convention

- Use **kebab-case** for file names: `ac-service-hero.jpg`
- Be descriptive: `foam-jet-service-2-acs.jpg` not `img1.jpg`
- Include size/variant if needed: `smart-lock-large.jpg`, `smart-lock-thumb.jpg`

## Image Types

- **Hero images**: Large banner images for page headers
- **Service images**: Images for service cards and listings
- **Product images**: Product photos
- **Testimonial images**: User/customer photos
- **Illustrations**: Custom illustrations and graphics

