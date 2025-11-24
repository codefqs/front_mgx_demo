# Prototype Template

## Overview

This is a specialized template for product prototype design, focusing on interface aesthetics and functional rationality for web applications, mobile apps, or mini-programs.

**Note**: The root-level `index.html`, `style.css`, `script.js` are minimal preview files for display purposes only. When generating prototypes, completely replace them with your application code without being influenced by the preview page design.

## Template Features

### Design-Oriented
- **Interface Aesthetics Priority**: Focus on visual design and user experience
- **Interactive Prototypes**: Support rapid construction of interactive product prototypes
- **Responsive Design**: Adapt to different devices and screen sizes

### Functional Rationality
- **User Flow Design**: Optimize user operation paths and experience flows
- **Feature Validation**: Quickly validate the feasibility of product feature concepts
- **Iterative Optimization**: Support rapid prototype iteration and design improvements

## Prototype Design Focus

This template emphasizes **prototype concepts** rather than full implementation:

- **Visual Hierarchy**: Prioritize clear visual structure and information architecture
- **Interaction Patterns**: Focus on intuitive user interactions and navigation flows
- **User Experience**: Validate user journey and interface usability
- **Concept Validation**: Test product ideas before full development
- **Design Iteration**: Enable rapid design changes and improvements


## Difference from HTML Template

| Feature | Prototype Template | HTML Template |
|---------|-------------------|---------------|
| **Primary Purpose** | Product prototype design | Web development |
| **Focus** | Interface aesthetics, functional rationality | Web functionality implementation |
| **Design Philosophy** | User experience-oriented | Technology implementation-oriented |
| **Development Goal** | Validate product concepts | Build complete websites |
| **Use Cases** | Product design, prototype validation | Website development, page creation |

## When to Use This Template

### Product Prototype Scenarios
- **"Design a mobile app prototype for food delivery"**
- **"Create a UI mockup for an e-commerce platform"**
- **"Build a prototype for a social media application"**
- **"Design a user onboarding flow for a new app"**

### UI/UX Design Requests
- **"Create a user interface design for a fitness tracking app"**
- **"Design a landing page for a startup product"**
- **"Build a prototype for a banking mobile application"**
- **"Create a wireframe for a mobile shopping experience"**

### MVP and Concept Validation
- **"Build a minimum viable product prototype"**
- **"Create a proof of concept for a new feature"**
- **"Design a user flow for a subscription service"**
- **"Prototype a mobile game interface"**

## Use Cases

- **Product Managers**: Rapidly build product prototypes for requirement validation
- **UI/UX Designers**: Create interactive prototypes to showcase design concepts
- **Development Teams**: Validate product functionality design before formal development
- **Startup Teams**: Quickly create MVP prototypes for market validation


## Critical Requirements

## Image Processing Best Practices

1. **Generate AI Images**: Always use ImageCreator.generate_image to create high-quality, contextually relevant images. This provides stable, consistent results tailored to your content needs.

**ImageCreator Command Format:**
```xml
<ImageCreator.generate_image>
<description>Detailed visual description including subject, mood, elements, colors, and composition</description>
<filename>descriptive-image-name.jpg</filename>
<style>photorealistic|cartoon|sketch|watercolor|minimalist|3d</style>
</ImageCreator.generate_image>
```

**Parameter Guidelines:**
- `<description>`: Be specific and detailed about the visual content. Include subject, elements, atmosphere, colors, and composition - do NOT include style keywords (e.g., "Modern office workspace with large windows, natural lighting, minimalist furniture, plants, warm atmosphere with soft shadows")
- `<filename>`: Use descriptive kebab-case names with .jpg extension (e.g., "modern-office-workspace.jpg")
- `<style>`: Choose from available styles:
  - `photorealistic` - Photorealistic, high detail, professional photography
  - `cartoon` - Cartoon style, colorful, animated
  - `sketch` - Pencil sketch, black and white, artistic
  - `watercolor` - Watercolor painting, soft edges, artistic
  - `minimalist` - Minimalist design, clean, simple
  - `3d` - 3D render, blender, octane render

2. **Path Format**: Reference generated images using the assets path:
   ```tsx
   <img src="/assets/modern-office-workspace.jpg" alt="Description" className="max-w-md max-h-64 object-contain" />
   ```


### JS Completeness (MANDATORY)
- **CRITICAL**: Every JavaScript file reference MUST include `type="module"` attribute when using Vite
- **Correct usage**: `<script type="module" src="./script.js"></script>`
- **Why it's required**: This project uses Vite as the build tool, which requires module-type scripts
- **What happens without it**: JavaScript imports will fail and the script will not execute properly, causing functionality breakage
- **Note**: For standalone scripts without ES6 imports/exports, you can use regular `<script src="./script.js"></script>` to avoid CORS issues when opening files directly

**Example:**
```html
<!-- ✅ Correct - Will work with Vite -->
<script type="module" src="./script.js"></script>

<!-- ✅ Also correct - For standalone scripts opened via file:// -->
<script src="./auth.js"></script>
```

### Running Local Server (Recommended)
To avoid CORS issues when developing, use a local server:

**Option 1: Using Node.js server**
```bash
npm run serve
# or
node server.js
```
Then open `http://localhost:3000` in your browser.

**Option 2: Using Python (if Node.js not available)**
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

**Option 3: Using Vite**
```bash
npm run dev
``` 
JavaScript Undefined Function Design Guidelines

1. Core Principles
Bind Events After DOM Ready: Attach all event listeners inside DOMContentLoaded.
Prefer Event Delegation: Handle all events on a parent node using data-* attributes.
Keep Scope Clean: Do not attach functions to the global object; use modules or closures.

2. Recommended Code Template
```tsx
document.addEventListener('DOMContentLoaded', () => {
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const { action, ...data } = el.dataset;
    if (handlers[action]) handlers[action](data);
  });
});

const handlers = {
  showPage: ({ page }) => console.log('Show:', page),
  addToCart: ({ itemId }) => console.log('Add:', itemId)
};
```

3. Design Guidelines
Use data-action to specify behavior.
Keep all logic centralized in a handlers object.
Validate element type before calling .closest().
Never declare functions or variables in the global scope.

### CSS Completeness (MANDATORY)
- **More lines** of CSS for complex dashboards
- **Complete theme system** with light/dark mode variables
- **All component styles** must be defined (buttons, cards, forms, tables, etc.)
- **No browser default styles** - every element needs custom styling

### Table Layout Control (MANDATORY)
When creating data tables, you MUST include these essential styles:

```css
.table-container {
  overflow-x: auto;        /* Enable horizontal scrolling */
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
}

.data-table {
  width: 100%;
  table-layout: fixed;     /* CRITICAL: Fixed layout prevents stretching */
  border-collapse: collapse;
  min-width: 800px;        /* CRITICAL: Minimum width */
}

/* Column Width Control - Prevent uneven stretching */
.data-table th:nth-child(1), .data-table td:nth-child(1) { width: 25%; } /* Name */
.data-table th:nth-child(2), .data-table td:nth-child(2) { width: 30%; } /* Email */
.data-table th:nth-child(3), .data-table td:nth-child(3) { width: 12%; } /* Role */
.data-table th:nth-child(4), .data-table td:nth-child(4) { width: 12%; } /* Status */
.data-table th:nth-child(5), .data-table td:nth-child(5) { width: 15%; } /* Last Login */
.data-table th:nth-child(6), .data-table td:nth-child(6) { width: 6%; }  /* Actions */

.data-table td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 1rem;
}
```

## Best Practices

- Keep interfaces clean and highlight core functionality
- Use consistent visual language and interaction patterns
- Focus on mobile experience optimization
- Regularly collect user feedback and iterate improvements

Design Protocal:

# 1. Visual Design Dimension
 **Color Scheme** :Primary and secondary colors are harmonious; consistent with brand/product positioning; limited to ≤3 main colors; sufficient contrast; no clashing or chaotic colors.        
 **Layout & Composition** :Clear hierarchy of content; visual focus is prominent; spacing between modules is reasonable; elements are aligned; no overcrowding or scattered distribution.                
 **Typography**: Consistent font style; font size hierarchy is clear (headings/body/notes); line spacing and letter spacing are appropriate; avoid large blocks of dense text.                 
 **Image Quality**: Images are clear without distortion; consistent style (line art/photos/illustrations, etc.); resolution suitable for different screens; avoid overuse of decorative graphics. 

# 2. Interface Elements Dimension
 **Navigation Design** : Navigation is clearly positioned; hierarchy is reasonable (≤3 levels); current page status is highlighted; breadcrumb or return paths are clear.                                     
 **Buttons & Interactive Elements** : Buttons are prominent and obviously clickable; primary/secondary buttons are distinguished; hover/click feedback is clear; touch area is sufficient; no risk of accidental clicks.  
 **Form Design** : Simple structure; input field sizes are appropriate; required fields are clearly marked; error messages are timely and friendly; support for masking/auto-complete/input validation. 
 **Icon Design**  : Icons are semantically accurate; style is consistent (line/solid, etc.); proportions are balanced; visually supportive without being dominant.                                       

# 3. Overall Style Dimension
 **Style Consistency** : All page elements (colors, fonts, icons, components) are consistent; no mixed styles; design language is coherent across the workflow.                                        
 **Modernness** : Follows contemporary design trends (flat design, whitespace, soft gradients, minimalist icons); visuals are not outdated; avoids old-fashioned iconography.                   
 **Brand Alignment** : Colors, fonts, and graphics align with brand recognition; consistent with brand positioning (youthful, professional, tech-oriented, etc.); strong brand identity recognition. 

# 4. Technical Implementation Dimension
 **Responsive Design**: Adaptive across desktop, tablet, and mobile; smooth breakpoint transitions; no misalignment, duplication, or layout errors.                    
 **Animation Design**: Animations are natural and smooth (≤300ms); transitions are not abrupt; animation is not overused; supports user interruption of interactions. 
 **Compatibility** : Compatible with mainstream browsers; supports common systems/resolutions; no missing fonts or layout compatibility issues.                     

# 5. User Experience Dimension
**Usability** : Operation flow is intuitive; information architecture is logical; easy for users to learn; follows platform conventions (iOS/Android/Web).                                                                              
**Content Presentation** : Content is well-structured; information hierarchy is clear; not redundant; text is concise; interaction is not overly complex; avoids information overload.                                                             
**Emotional Experience** : Visual and interactive style creates a positive mood; design is friendly and trustworthy; users feel a sense of achievement after completing tasks; micro-interactions show care (e.g., empty states/success feedback). 

---


---

*This template is optimized for product prototype design, helping you quickly build beautiful and functionally sound product prototypes.*
