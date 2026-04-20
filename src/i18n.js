import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {

      "dashboard": "Dashboard",
      "approvals": "Approvals",
      "members": "Members",
      "employees": "Staff",
      "leaderboard": "Rankings",
      "settings": "Settings",
      "more": "More",
      "sign_out": "Sign Out",
      "edit_requests": "Edit Requests",
      "my_profile": "My Profile",


      "platform_overview": "Platform overview",
      "helping_message": "Every approval connects a family to essential food, goods and support. Review with care.",
      "helping_title": "Helping those who need it most",
      "est_funds": "Funds (TK)",
      "pending_approvals": "Pending",
      "total_members": "Members",
      "total_employees": "Staff",
      "job_applicants": "Job Applicants",
      "job_applicants_count": "{{count}} job applicant",
      "job_applicants_count_plural": "{{count}} job applicants",


      "action_required": "Pending Approvals",
      "all_caught_up": "All caught up! No pending applications.",
      "approve": "Approve",
      "reject": "Reject",
      "delete": "Delete",
      "method": "Method",
      "nid": "NID",
      "trx_id": "TrxID",
      "applications_count": "{{count}} application awaiting review",
      "applications_count_plural": "{{count}} applications awaiting review",


      "members_title": "Members",
      "add_member": "Add Member",
      "no_members": "No members yet.",
      "full_name": "Full Name",
      "father_name": "Father's Name",
      "phone": "Phone",
      "payment_method": "Payment Method",
      "trx_id_label": "Transaction ID",
      "password": "Password",
      "profile_photo": "Profile Photo",
      "cancel": "Cancel",
      "register_member": "Register Member",
      "saving": "Saving…",
      "as_per_nid": "As per NID",


      "employees_title": "Staff Members",
      "add_staff": "Add Staff",
      "no_staff": "No staff yet.",
      "email": "Email",
      "address": "Address",
      "temp_password": "Temporary Password",
      "temp_password_hint": "Employee must change password on first login.",
      "create_employee": "Create Employee",
      "owner_only": "You need owner-level access to manage staff.",
      "staff_count": "{{count}} employee",
      "staff_count_plural": "{{count}} employees",


      "rankings_title": "Rankings",
      "rankings_desc": "Top performing staff by member recruitment",
      "no_data": "No data yet.",
      "members_label": "MEMBERS",


      "settings_title": "Settings",
      "save_all": "Save All",
      "general": "General",
      "platform_policies": "Platform policies",
      "reg_fee": "Registration Fee (TK)",
      "employee_view_all": "Employees can view all members",
      "owner_only_access": "Owner access only.",
      "disable": "Disable",
      "enable": "Enable",
      "account_number": "Account Number",
      "instructions": "Instructions",


      "sign_in": "Sign In",
      "admin_subtitle": "Admin portal for community care management",
      "use_credentials": "Use your operator credentials",
      "phone_id": "Phone / ID",
      "signing_in": "Signing in…",
      "access_denied": "Access denied for this account.",
      "login_failed": "Login failed. Check credentials.",


      "security_check": "Security Check",
      "set_password_msg": "Set a new password before you continue",
      "new_password": "New Password",
      "set_password": "Set Password",


      "brand_name": "PBL Sheba",
      "brand_tagline": "Community Care Platform",
      "member_form_desc": "Fill in the member's personal details and payment information to register them.",
      "staff_form_desc": "Create an operator account. They'll be prompted to set their own password on first login.",
      "pending": "Pending",
      "confirm_approve": "Are you sure you want to approve?",
      "confirm_reject": "Are you sure you want to reject?",
      "confirm_delete": "Are you sure you want to delete?",


      "survey": "Survey",
      "surveys": "Surveys",
      "collect_data": "Collect Data",
      "survey_dashboard": "Survey Results",
      "name_label": "Full Name",
      "fathers_husband_label": "Father's / Husband's Name",
      "ward_label": "Ward No",
      "farm_animals_label": "Farm Animals",
      "farmable_land_label": "Farmable Land",
      "house_type_label": "House Type",
      "family_members_label": "Family Members",
      "gender_label": "Gender",
      "children_boy_label": "Children (Boy)",
      "children_girl_label": "Children (Girl)",
      "income_label": "Monthly Income",
      "phone_label": "Phone Number",
      "submit_survey": "Submit Survey",
      "success_survey": "Survey submitted successfully!",
      "duplicate_survey": "A survey with this phone number already exists.",
      "export_pdf": "Export PDF",
      "export_excel": "Export Excel",
      "all_employees": "All Staff",
      "filter_by_staff": "Filter by Staff",
      "total_surveys": "Total Surveys",
      "survey_stats": "Performance Metrics",
      "sl_no": "SL",
      "house_house": "House-to-House Survey",
      "male": "Male",
      "female": "Female",
      "other": "Other",
      "tin_shed": "Tin Shed",
      "brick_built": "Brick Built",
      "mud_house": "Mud House"
    }
  },
  bn: {
    translation: {

      "dashboard": "ড্যাশবোর্ড",
      "approvals": "অনুমোদন",
      "members": "সদস্য",
      "employees": "কর্মী",
      "leaderboard": "র‍্যাংকিং",
      "settings": "সেটিংস",
      "more": "আরও",
      "sign_out": "প্রস্থান",
      "edit_requests": "সংশোধন অনুরোধ",
      "my_profile": "আমার প্রোফাইল",
      "job_applicants": "চাকরির আবেদন",
      "job_applicants_count": "{{count}} চাকরির আবেদন",
      "job_applicants_count_plural": "{{count}} চাকরির আবেদন",


      "platform_overview": "প্ল্যাটফর্মের সারসংক্ষেপ",
      "helping_message": "প্রতিটি অনুমোদন একটি পরিবারকে প্রয়োজনীয় খাদ্য ও সহায়তার সাথে যুক্ত করে। যত্নসহকারে পর্যালোচনা করুন।",
      "helping_title": "যাদের সবচেয়ে বেশি প্রয়োজন তাদের সাহায্য করছি",
      "est_funds": "তহবিল (টাকা)",
      "pending_approvals": "অপেক্ষমাণ",
      "total_members": "সদস্য",
      "total_employees": "কর্মী",


      "action_required": "অপেক্ষমাণ অনুমোদন",
      "all_caught_up": "সব ঠিক আছে! কোনো অপেক্ষমাণ আবেদন নেই।",
      "approve": "অনুমোদন করুন",
      "reject": "প্রত্যাখ্যান",
      "delete": "মুছুন",
      "method": "পদ্ধতি",
      "nid": "এনআইডি",
      "trx_id": "লেনদেন আইডি",
      "applications_count": "{{count}}টি আবেদন পর্যালোচনার অপেক্ষায়",
      "applications_count_plural": "{{count}}টি আবেদন পর্যালোচনার অপেক্ষায়",


      "members_title": "সদস্যগণ",
      "add_member": "সদস্য যোগ করুন",
      "no_members": "এখনও কোনো সদস্য নেই।",
      "full_name": "পূর্ণ নাম",
      "father_name": "পিতার নাম",
      "phone": "মোবাইল নম্বর",
      "payment_method": "পেমেন্ট পদ্ধতি",
      "trx_id_label": "লেনদেন আইডি",
      "password": "পাসওয়ার্ড",
      "profile_photo": "প্রোফাইল ছবি",
      "cancel": "বাতিল",
      "register_member": "সদস্য নিবন্ধন করুন",
      "saving": "সংরক্ষণ হচ্ছে…",
      "as_per_nid": "এনআইডি অনুযায়ী",


      "employees_title": "কর্মীগণ",
      "add_staff": "কর্মী যোগ করুন",
      "no_staff": "এখনও কোনো কর্মী নেই।",
      "email": "ইমেইল",
      "address": "ঠিকানা",
      "temp_password": "অস্থায়ী পাসওয়ার্ড",
      "temp_password_hint": "কর্মীকে প্রথম লগইনে পাসওয়ার্ড পরিবর্তন করতে হবে।",
      "create_employee": "কর্মী তৈরি করুন",
      "owner_only": "কর্মী পরিচালনার জন্য মালিক স্তরের অ্যাক্সেস প্রয়োজন।",
      "staff_count": "{{count}} জন কর্মী",
      "staff_count_plural": "{{count}} জন কর্মী",


      "rankings_title": "র‍্যাংকিং",
      "rankings_desc": "সদস্য নিয়োগে সেরা কর্মীরা",
      "no_data": "এখনও কোনো তথ্য নেই।",
      "members_label": "সদস্য",


      "settings_title": "সেটিংস",
      "save_all": "সব সংরক্ষণ করুন",
      "general": "সাধারণ",
      "platform_policies": "প্ল্যাটফর্ম নীতিমালা",
      "reg_fee": "নিবন্ধন ফি (টাকা)",
      "employee_view_all": "কর্মীরা সকল সদস্য দেখতে পারবেন",
      "owner_only_access": "শুধুমাত্র মালিক অ্যাক্সেস করতে পারবেন।",
      "disable": "নিষ্ক্রিয় করুন",
      "enable": "সক্রিয় করুন",
      "account_number": "অ্যাকাউন্ট নম্বর",
      "instructions": "নির্দেশনা",


      "sign_in": "প্রবেশ করুন",
      "admin_subtitle": "কমিউনিটি কেয়ার ব্যবস্থাপনার অ্যাডমিন পোর্টাল",
      "use_credentials": "আপনার অপারেটর তথ্য ব্যবহার করুন",
      "phone_id": "ফোন / আইডি",
      "signing_in": "প্রবেশ হচ্ছে…",
      "access_denied": "এই অ্যাকাউন্টের জন্য প্রবেশাধিকার নেই।",
      "login_failed": "লগইন ব্যর্থ হয়েছে। তথ্য পরীক্ষা করুন।",


      "security_check": "নিরাপত্তা যাচাই",
      "set_password_msg": "চালিয়ে যাওয়ার আগে নতুন পাসওয়ার্ড সেট করুন",
      "new_password": "নতুন পাসওয়ার্ড",
      "set_password": "পাসওয়ার্ড সেট করুন",


      "brand_name": "পিবিএল সেবা",
      "brand_tagline": "কমিউনিটি কেয়ার প্ল্যাটফর্ম",
      "member_form_desc": "সদস্যের ব্যক্তিগত তথ্য এবং পেমেন্ট বিবরণ পূরণ করে নিবন্ধন সম্পন্ন করুন।",
      "staff_form_desc": "একটি অপারেটর অ্যাকাউন্ট তৈরি করুন। তাদের প্রথম লগইনে পাসওয়ার্ড পরিবর্তন করতে বলা হবে।",
      "pending": "অপেক্ষমাণ",
      "confirm_approve": "আপনি কি নিশ্চিত যে আপনি এটি অনুমোদন করতে চান?",
      "confirm_reject": "আপনি কি নিশ্চিত যে আপনি এটি প্রত্যাখ্যান করতে চান?",
      "confirm_delete": "আপনি কি নিশ্চিত যে আপনি এটি মুছতে চান?",


      "survey": "জরিপ",
      "surveys": "জরিপসমূহ",
      "collect_data": "তথ্য সংগ্রহ",
      "survey_dashboard": "জরিপের ফলাফল",
      "name_label": "পুরো নাম",
      "fathers_husband_label": "পিতা / স্বামীর নাম",
      "ward_label": "ওয়ার্ড নং",
      "farm_animals_label": "গৃহপালিত পশু",
      "farmable_land_label": "চাষযোগ্য জমি",
      "house_type_label": "বাড়ির ধরণ",
      "family_members_label": "পরিবারের সদস্য",
      "gender_label": "লিঙ্গ",
      "children_boy_label": "সন্তান (ছেলে)",
      "children_girl_label": "সন্তান (মেয়ে)",
      "income_label": "মাসিক আয়",
      "phone_label": "মোবাইল নম্বর",
      "submit_survey": "জরিপ জমা দিন",
      "success_survey": "জরিপ সফলভাবে জমা হয়েছে!",
      "duplicate_survey": "এই ফোন নম্বর দিয়ে ইতিমধ্যে একটি জরিপ জমা দেয়া হয়েছে।",
      "export_pdf": "পিডিএফ ডাউনলোড",
      "export_excel": "এক্সেল ডাউনলোড",
      "all_employees": "সকল কর্মী",
      "filter_by_staff": "কর্মী অনুযায়ী ফিল্টার",
      "total_surveys": "মোট জরিপ",
      "survey_stats": "কাজের পরিসংখ্যান",
      "sl_no": "ক্রমিক",
      "house_house": "বাড়ি-বাড়ি জরিপ",
      "male": "পুরুষ",
      "female": "মহিলা",
      "other": "অন্যান্য",
      "tin_shed": "টিন শেড",
      "brick_built": "পাঁকা বাড়ি",
      "mud_house": "কাঁচা বাড়ি"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('pbl_lang') || 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false }
  });

export default i18n;
