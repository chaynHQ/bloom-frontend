## Key Concepts

### Public Bloom

Bloom extends its support to individuals worldwide through its accessible platform, allowing anyone to register as a "public" Bloom user. Public Bloom users gain entry to selected courses designed to provide vital information and resources. These self-guided/static courses empower users to navigate their trauma journey at their own pace and convenience.

### Partner Access and Multi-tenancy

In addition to the public offering, Bloom caters to partner organizations, such as Bumble, who extend Bloom's services to their user base through "Partner Access." This privileged access grants users additional features beyond the public Bloom, including therapy sessions, 1:1 chat support, and an expanded course catalog. Partner Access is administered by Partner Admins, who generate unique access codes for users to activate during registration or later through the dedicated `/apply-code` page. Refer to the [database schemas](https://github.com/chaynHQ/bloom-backend#database-models) for comprehensive insights into this functionality.

### Features

- **Bloom Courses:** Comprising structured sessions, Bloom courses guide users through essential steps, such as watching videos, completing activities, and accessing bonus content. Users can track their progress by marking sessions as complete, with course availability tailored based on their partner affiliations and selected courses.
  
- **Bloom Therapy:** Certain users, based on their partner access level, gain access to therapy sessions, which they can conveniently book using the integrated Simplybook booking widget. Offering therapy in multiple languages, Bloom enables users to choose their preferred language and therapist. Additionally, webhooks triggered by Zapier facilitate real-time updates to users' remaining therapy sessions.
  
- **Bloom 1-1 Chat:** Available to all users, Bloom's 1-1 chat feature enables seamless communication with the Bloom team for questions, support, or clarifications related to course content or other concerns. Integrated within session pages, the Crisp widget provides users with direct access to support whenever needed.
  
- **Notes from Bloom:** This feature allows users to subscribe to WhatsApp messages, receiving affirmational quotes, videos, or snapshots of course content twice a week. Leveraging Respond.io, users' contact information is managed, with Zapier facilitating the addition or removal of contacts to ensure timely message delivery.

### User Types

- **User:** Standard Bloom users, who may either access public Bloom or have Partner Access with additional features, depending on their affiliations.
  
- **Partner Admin User:** Designated members of partner organizations responsible for managing Bloom-related tasks, such as creating new Partner Access codes. Partner Admin pages, located under `/partner-admin`, serve as a dedicated sub-site for these administrative activities.
  
- **Super Admin User:** Chayn personnel entrusted with administrative privileges, enabling them to create Partner Admins. Accessible via `admin/dashboard`, Super Admins oversee user management within the platform.

### State Management - Redux Toolkit

Redux Toolkit (RTK) serves as the backbone for state management within Bloom, predominantly focusing on user-related data sourced from backend API calls. The `user/me` endpoint, upon login or app refresh, populates the `User`, `Courses`, `PartnerAccess`, and `ParterAdmin` states, facilitating consistent access control and feature display across the application. Leveraging RTK Query, data retrieval and caching are optimized, ensuring efficient app performance. State slices align closely with the [database schemas](https://github.com/chaynHQ/bloom-backend#database-models), maintaining data integrity and coherence throughout the application.

### Internationalization

Bloom caters to a diverse global audience by supporting multiple languages across the platform. Static text is seamlessly translated using [next-intl](https://github.com/amannn/next-intl), while Storyblok content adopts a translatable approach for each field, delivering localized content based on the user's locale. Integrations prioritize internationalization, with Crisp and Simplybook supporting multiple time zones and languages, ensuring a seamless experience for users worldwide.

### Storyblok CMS

Empowering content management, Bloom leverages [Storyblok](https://www.storyblok.com/) as its headless CMS, facilitating content editing, previewing, and publishing. The platform offers flexible content creation, enabling the dynamic generation of pages and components, as well as granular control over content presentation. Course and Session pages are structured to reflect the course hierarchy, allowing for intuitive navigation and content organization. Leveraging Storyblok's dynamic components and pages, Bloom delivers a personalized and interactive user experience, dynamically rendering content based on user preferences and interactions.

---

