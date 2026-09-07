// Default profile fields. Flat list — adding a "custom field" later is just pushing
// another object with the same shape. No schema change needed anywhere else.
const DEFAULT_FIELDS = [
  // Identity
  { key: "firstName", label: "First name", value: "", aliases: ["first name","fname","given name","forename","legal first name"] },
  { key: "middleName", label: "Middle name", value: "", aliases: ["middle name","mname","middle initial"] },
  { key: "lastName", label: "Last name", value: "", aliases: ["last name","lname","surname","family name","legal last name"] },
  { key: "fullName", label: "Full name", value: "", aliases: ["full name","name","your name","legal name"] },
  { key: "preferredName", label: "Preferred name", value: "", aliases: ["preferred name","nickname","goes by"] },
  { key: "email", label: "Email", value: "", aliases: ["email","email address","e-mail"] },
  { key: "phone", label: "Phone", value: "", aliases: ["phone","phone number","mobile","cell","telephone","contact number"] },

  // Links
  { key: "linkedin", label: "LinkedIn", value: "", aliases: ["linkedin","linkedin url","linkedin profile"] },
  { key: "github", label: "GitHub", value: "", aliases: ["github","github url","github profile"] },
  { key: "portfolio", label: "Portfolio / Website", value: "", aliases: ["portfolio","website","personal website","portfolio url","personal site"] },

  // Address
  { key: "street", label: "Street address", value: "", aliases: ["street address","address","address line 1","street"] },
  { key: "street2", label: "Address line 2", value: "", aliases: ["address line 2","apt","apartment","suite","unit"] },
  { key: "city", label: "City", value: "", aliases: ["city","town"] },
  { key: "state", label: "State / Province", value: "", aliases: ["state","province","state/province","region"] },
  { key: "zip", label: "ZIP / Postal code", value: "", aliases: ["zip","zip code","postal code","postcode"] },
  { key: "country", label: "Country", value: "", aliases: ["country","nation"] },

  // EEO / screening
  { key: "workAuth", label: "Work authorization", value: "", aliases: ["work authorization","authorized to work","legally authorized"] },
  { key: "sponsorship", label: "Needs sponsorship", value: "", aliases: ["sponsorship","require sponsorship","visa sponsorship"] },
  { key: "veteranStatus", label: "Veteran status", value: "", aliases: ["veteran status","veteran","protected veteran"] },
  { key: "gender", label: "Gender", value: "", aliases: ["gender","sex"] },
  { key: "race", label: "Race / Ethnicity", value: "", aliases: ["race","ethnicity","race/ethnicity"] },
  { key: "disability", label: "Disability status", value: "", aliases: ["disability","disability status"] },
];

// Exposed for both extension pages (classic script tags, no module system needed).
if (typeof module !== "undefined") module.exports = { DEFAULT_FIELDS };
