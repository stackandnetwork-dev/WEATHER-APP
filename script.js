// usename fetch and input and store and display

const name = localStorage.getItem("username");
if (!name) {
  const popup_container = document.getElementById("popup_container");
  popup_container.style.display = "flex";
} else {
  popup_container.style.display = "none";
  const username_display = document.getElementById("username");
  username_display.textContent = name;
  const username_display2 = document.getElementById("username2");
  username_display2.textContent = name;
  const username_display3 = document.getElementById("username_change");
  username_display3.value = name;
}

function updateUsername() {
  const name = localStorage.getItem("username");
  if (!name) {
    const popup_container = document.getElementById("popup_container");
    popup_container.style.display = "flex";
  } else {
    popup_container.style.display = "none";
    const username_display = document.getElementById("username");
    username_display.textContent = name;
    const username_display2 = document.getElementById("username2");
    username_display2.textContent = name;
    const username_display3 = document.getElementById("username_change");
    username_display3.value = name;
  }
}

const save_username = document.getElementById("save_username");
const form_input = document.getElementById("popup_form");
form_input.addEventListener("submit", () => {
  const username = document.getElementById("username_input");
  localStorage.setItem("username", username.value);
  const name = localStorage.getItem("username");
  const username_display = document.getElementById("username");
  if (name) {
    const popup_container = document.getElementById("popup_container");
    popup_container.style.display = "none";
    username_display.textContent = name;
    const username_display2 = document.getElementById("username2");
    username_display2.textContent = name;
  }
});
const profile_popup_container= document.getElementById("profile_popup_container");
const username_change = document.getElementById("username_change");
const email_input = document.getElementById("email_change");
const save_profile = document.getElementById("save_profile");
save_profile.addEventListener("click", () => {
  localStorage.setItem("username", username_change.value);
  localStorage.setItem("email", email_input.value);

  updateUsername();
  document.getElementById("popup_container").style.display = "none";

  profileCompletionStatus_main();
  document.getElementById("save_condition_sub").style.display = "flex";
    setTimeout(() => {
        document.getElementById("save_condition_sub").style.display = "none";
        profile_popup_container.classList.remove("active");
    }, 1500);
    


});

const email = localStorage.getItem("email");
if (email == "not_set") {
  email_input.value = "";
} else {
  email_input.value = email;
}

function profileCompletionStatus() {
  const image = localStorage.getItem("profileImage");
  const email = localStorage.getItem("email");
  let completion = 0;
  if (image) completion += 50;
  if (email && email !== "not_set") completion += 50;
  return completion;
}

// navigation nuttons sidebar

const sidebar = document.getElementById("navigation_btns");
const ham_button = document.getElementById("hamburger_btn");
const nav_pa = document.querySelectorAll(".nav_pa");
const main_section = document.getElementById("main_container");
const nav_item = document.getElementById("nav_item");
const navigation_btns = document.getElementById("navigation_btns");

// Initialize sidebar state based on screen size
function initializeSidebar() {
  const isMobile = window.innerWidth <= 768;

  // Always start collapsed by default
  sidebar.classList.remove("active");
  main_section.classList.remove("active");
  ham_button.classList.remove("active");
}

// Initialize on page load
initializeSidebar();

// Re-initialize on window resize
window.addEventListener("resize", initializeSidebar);

ham_button.addEventListener("click", () => {
  const isMobile = window.innerWidth <= 768;

  sidebar.classList.toggle("active");

  // On desktop, push main content; on mobile, it's just dropdown overlay
  if (!isMobile) {
    main_section.classList.toggle("active");
    // Only toggle text visibility on desktop
    nav_pa.forEach((item) => {
      item.classList.toggle("active");
    });
  }

  // Toggle hamburger icon animation
  ham_button.classList.toggle("active");
});

const dashboard_section = document.getElementById("dashboard");
const weather_section = document.getElementById("weather");
const maps_section = document.getElementById("maps");
const forecast_section = document.getElementById("forecast");

const nav_items = document.querySelectorAll(".nav_item");
const all_sections = [
  dashboard_section,
  weather_section,
  maps_section,
  forecast_section,
];

nav_items.forEach((item) => {
  item.addEventListener("click", () => {
    const target = item.getAttribute("data-target");

    // Remove active class from all nav items and buttons
    nav_items.forEach((navItem) => {
      navItem.classList.remove("active");
      const navBtn = navItem.querySelector(".nav_btn");
      if (navBtn) navBtn.classList.remove("active");
    });

    // Hide all sections
    all_sections.forEach((section) => {
      if (section) section.classList.remove("active");
    });

    // Add active class to clicked item and its button
    item.classList.add("active");
    const navBtn = item.querySelector(".nav_btn");
    if (navBtn) navBtn.classList.add("active");

    if (target === "dashboard" && dashboard_section) {
      dashboard_section.classList.add("active");
    }
    if (target === "weather" && weather_section)
      weather_section.classList.add("active");
    if (target === "maps" && maps_section) maps_section.classList.add("active");
    if (target === "forecast" && forecast_section)
      forecast_section.classList.add("active");

    // Close mobile sidebar when nav item is clicked
    if (window.innerWidth <= 768) {
      sidebar.classList.remove("active");
      ham_button.classList.remove("active");
    }
  });
});

// Close mobile sidebar when clicking outside
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 768) {
    const isClickedInside =
      event.target.closest("#navbar") ||
      event.target.closest("#navigation_btns");
    if (!isClickedInside && sidebar.classList.contains("active")) {
      sidebar.classList.remove("active");
      ham_button.classList.remove("active");
    }
  }
});

// profile completion

// profile dropdown
const svg = document.getElementById("svg_cont");
const prof_btn = document.getElementById("profile_button");
const prof_dropdown = document.getElementById("dropdown");
prof_btn.addEventListener("click", (event) => {
  prof_dropdown.classList.toggle("active");
});
window.addEventListener("click", (event) => {
  const clickedBtn = event.target.closest("#profile_button");
  const clickedDropdown = event.target.closest("#dropdown");

  if (!clickedBtn && !clickedDropdown) {
    prof_dropdown.classList.remove("active");
  }
});

// Location dropdown handler

const btns = document.querySelectorAll(".settings_button");
const settings_page = document.getElementById("settings_container");
btns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    settings_page.classList.add("active");
    // Only hide navigation on mobile; keep it visible on desktop
    if (isMobileView()) {
      settings_navigation.style.display = "none";
    }
  });
});

const btn = document.getElementById("settings_btn");

btn.addEventListener("click", (event) => {
  settings_page.classList.add("active");
});

const settings = document.getElementById("settings");
settings_page.addEventListener("click", (event) => {
  if (!event.target.closest("#settings")) {
    settings_page.classList.remove("active");
  }
});

const display_settings = document.getElementById("settings_display");
const theme_settings = document.getElementById("settings_Theme");
const account_settings = document.getElementById("settings_Account");
const city_settings = document.getElementById("settings_City");

// Get content sections
const display_content = document.getElementById("display");
const theme_content = document.getElementById("theme");
const account_content = document.getElementById("account");
const city_content = document.getElementById("city");

// Close settings button
const close_btns = document.querySelectorAll(".close_btn");
close_btns.forEach((btn) => {
  btn.addEventListener("click", (event) => {
    settings_page.classList.remove("active");
  });
});

// ============ COMPREHENSIVE SETTINGS MANAGEMENT ============

// All Default Settings
const defaults = {
  // Display Settings
  temperature_input: "celsius",
  windspeed_input: "kmh",
  precipitation_input: "mm",
  pressure_input: "hpa",
  date_format_input: "DD/MM/YYYY",
  time_format_input: "12h",

  // Theme Settings
  theme_mode_input: "auto",
  accent_color_input: "blue",
  font_size_input: "medium",
  animation_input: "enabled",

  // Account Settings
  email_input: "not_set",
  language_input: "en",
  alerts_input: "enabled",
  daily_updates_input: "enabled",

  // City Settings
  default_city_input: "current",
  location_permission_input: "enabled",
  saved_cities_input: "view",
  auto_detect_input: "enabled",

  // Settings Page State
  activeSettingsPage: "display",
};

// Initialize all defaults in local storage
function initializeDefaults() {
  Object.keys(defaults).forEach((key) => {
    if (localStorage.getItem(key) === null) {
      localStorage.setItem(key, defaults[key]);
      const element = document.getElementById(key);
      if (element) {
        element.value = defaults[key];
      }
    } else {
      // Load saved value into the element
      const element = document.getElementById(key);
      if (element) {
        element.value = localStorage.getItem(key);
      }
    }
  });
}

function handleSettingChange(event) {
  const key = event.target.id;
  const value = event.target.value;
  localStorage.setItem(key, value);
  console.log(`Saved ${key}: ${value}`);

  // Dispatch custom event so dashboard can listen
  const settingChangeEvent = new CustomEvent("settingChanged", {
    detail: { key, value },
  });
  window.dispatchEvent(settingChangeEvent);
}

// Function to load all settings on page refresh
function loadAllSettings() {
  const allSelects = document.querySelectorAll(".display_settings_item select");

  allSelects.forEach((select) => {
    const savedValue = localStorage.getItem(select.id);
    if (savedValue) {
      select.value = savedValue;
    }
  });
}

// Restore the previously active settings page
function restoreSettingsPage() {
  const activeSettingsPage =
    localStorage.getItem("activeSettingsPage") || "display";
  const isMobile = isMobileView();

  // Always remove show-back-btn on desktop
  if (!isMobile) {
    settingsPane.classList.remove("show-back-btn");
  }

  // Reset all active states
  display_settings.classList.remove("active");
  theme_settings.classList.remove("active");
  account_settings.classList.remove("active");
  city_settings.classList.remove("active");

  display_content.style.display = "none";
  theme_content.style.display = "none";
  account_content.style.display = "none";
  city_content.style.display = "none";

  // Set the active page
  if (activeSettingsPage === "display") {
    display_settings.classList.add("active");
    display_content.style.display = "flex";
    settings_navigation.style.display = "block";
    if (isMobile) {
      settings_navigation.style.display = "none";
      settingsPane.classList.add("show-back-btn"); // Hide navigation on mobile until a page is selected
    }
  } else if (activeSettingsPage === "theme") {
    theme_settings.classList.add("active");
    theme_content.style.display = "flex";
    settings_navigation.style.display = "block";
    if (isMobile) {
      settings_navigation.style.display = "none";
      settingsPane.classList.add("show-back-btn");
    }
  } else if (activeSettingsPage === "account") {
    account_settings.classList.add("active");
    account_content.style.display = "flex";
    settings_navigation.style.display = "block";
    if (isMobile) {
      settings_navigation.style.display = "none";
      settingsPane.classList.add("show-back-btn");
    }
  } else if (activeSettingsPage === "city") {
    city_settings.classList.add("active");
    city_content.style.display = "flex";
    settings_navigation.style.display = "block";
    if (isMobile) {
      settings_navigation.style.display = "none";
      settingsPane.classList.add("show-back-btn");
    }
  }
}

// Function to check if on mobile
function isMobileView() {
  return window.innerWidth <= 768;
}

// Update settings page click listeners to save state
display_settings.addEventListener("click", (event) => {
  localStorage.setItem("activeSettingsPage", "display");
  display_settings.classList.add("active");
  theme_settings.classList.remove("active");
  account_settings.classList.remove("active");
  city_settings.classList.remove("active");

  display_content.style.display = "flex";
  theme_content.style.display = "none";
  account_content.style.display = "none";
  city_content.style.display = "none";

  // On mobile, show back button and content
  if (isMobileView()) {
    settingsPane.classList.add("show-back-btn");
  }
});

theme_settings.addEventListener("click", (event) => {
  localStorage.setItem("activeSettingsPage", "theme");
  display_settings.classList.remove("active");
  theme_settings.classList.add("active");
  account_settings.classList.remove("active");
  city_settings.classList.remove("active");

  display_content.style.display = "none";
  theme_content.style.display = "flex";
  account_content.style.display = "none";
  city_content.style.display = "none";

  // On mobile, show back button and content
  if (isMobileView()) {
    settingsPane.classList.add("show-back-btn");
  }
});

account_settings.addEventListener("click", (event) => {
  localStorage.setItem("activeSettingsPage", "account");
  display_settings.classList.remove("active");
  theme_settings.classList.remove("active");
  account_settings.classList.add("active");
  city_settings.classList.remove("active");

  display_content.style.display = "none";
  theme_content.style.display = "none";
  account_content.style.display = "flex";
  city_content.style.display = "none";

  // On mobile, show back button and content
  if (isMobileView()) {
    settingsPane.classList.add("show-back-btn");
  }
});

city_settings.addEventListener("click", (event) => {
  localStorage.setItem("activeSettingsPage", "city");
  display_settings.classList.remove("active");
  theme_settings.classList.remove("active");
  account_settings.classList.remove("active");
  city_settings.classList.add("active");

  display_content.style.display = "none";
  theme_content.style.display = "none";
  account_content.style.display = "none";
  city_content.style.display = "flex";

  // On mobile, show back button and content
  if (isMobileView()) {
    settingsPane.classList.add("show-back-btn");
  }
});

// Mobile Settings Navigation Handler
const settingsPane = document.getElementById("settings_pane");
const settingsBackBtn = document.getElementById("settings_back_btn");

// Back button handler
if (settingsBackBtn) {
  settingsBackBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Hide back button and show navigation again
    settingsPane.classList.remove("show-back-btn");

    // Reset all active classes and hide all content
    display_settings.classList.remove("active");
    theme_settings.classList.remove("active");
    account_settings.classList.remove("active");
    city_settings.classList.remove("active");

    display_content.style.display = "none";
    theme_content.style.display = "none";
    account_content.style.display = "none";
    city_content.style.display = "none";
    settings_navigation.style.display = "block";
  });
}

// When window is resized, reset mobile view state if going to desktop
window.addEventListener("resize", () => {
  // Only adjust if settings are currently open
  if (settings_page.classList.contains("active")) {
    if (!isMobileView()) {
      // Going to desktop - show navigation and remove show-back-btn
      settingsPane.classList.remove("show-back-btn");
      settings_navigation.style.display = "block";
    } else {
      // Going to mobile - hide navigation if not already hidden
      if (settingsPane.classList.contains("show-back-btn")) {
        settings_navigation.style.display = "none";
      }
    }
  }
});

// Initialize on page load
initializeDefaults();
loadAllSettings();
restoreSettingsPage();

// Attach event listeners to all setting inputs
document.querySelectorAll(".display_settings_item select").forEach((select) => {
  select.addEventListener("change", handleSettingChange);
});

const changeProfilePicBtn = document.getElementById("change_profile_pic");
const fileInput = document.getElementById("profile_pic_input");
const profileImage = document.getElementById("profile_image");
const profileImage2 = document.getElementById("profile_image2");
const profileImage3 = document.getElementById("profile_image3");

function updateProfileImage() {
  const savedImage = localStorage.getItem("profileImage");
  if (savedImage) {
    if (profileImage) {
      profileImage.src = savedImage;
      profileImage.style.display = "block";
    }
    if (profileImage2) {
      profileImage2.src = savedImage;
      profileImage2.style.display = "block";
    }
    if (profileImage3) {
      profileImage3.src = savedImage;
      profileImage3.style.display = "block";
    }
  } else {
    if (profileImage) {
      profileImage.src = "";
      profileImage.style.display = "none";
    }
    if (profileImage2) {
      profileImage2.src = "";
      profileImage2.style.display = "none";
    }
    if (profileImage3) {
      profileImage3.src = "";
      profileImage3.style.display = "none";
    }
  }
}

// Trigger file input when button is clicked
if (changeProfilePicBtn) {
  changeProfilePicBtn.addEventListener("click", function (e) {
    e.preventDefault();
    fileInput.click();
  });
}

let cropper;
const modal = document.getElementById("cropModal");
const image = document.getElementById("imageToCrop");

fileInput.addEventListener("change", (e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result;
      modal.style.display = "flex";
      if (cropper) cropper.destroy();
      cropper = new Cropper(image, {
        aspectRatio: 1,
        viewMode: 1,
      });
    };
    reader.readAsDataURL(files[0]);
  }
});
updateProfileImage();

document.getElementById("cropButton").addEventListener("click", () => {
  const canvas = cropper.getCroppedCanvas();
  const croppedImageData = canvas.toDataURL("image/png");

  if (profileImage) {
    profileImage.src = croppedImageData;
  }
  localStorage.setItem("profileImage", croppedImageData);
  updateProfileImage();
  modal.style.display = "none";
  fileInput.value = "";
});

// Add close modal button listener
document.getElementById("closeModal").addEventListener("click", () => {
  modal.style.display = "none";
  fileInput.value = "";
  if (cropper) {
    cropper.destroy();
    cropper = null;
  }
});

const profile_dropdown_btn = document.getElementById("open_profile_dropdown");
const profile_dropdown = document.getElementById("profile_popup_container");

// Open/close profile popup when clicking View Profile button
if (profile_dropdown_btn && profile_dropdown) {
  profile_dropdown_btn.addEventListener("click", (e) => {
    e.stopPropagation();
    profile_dropdown.classList.add("active");
  });

  // Close profile popup when clicking outside (on the container background)
  profile_dropdown.addEventListener("click", (e) => {
    // Close only if clicking on the container, not on the popup itself
    if (e.target === profile_dropdown) {
      profile_dropdown.classList.remove("active");
    }
  });
}

const changeProfileBtn = document.getElementById("change_profile_pic");
const edit = document.getElementById("edit");
changeProfileBtn.addEventListener("mouseenter", (e) => {
  edit.classList.toggle("active");
});
changeProfileBtn.addEventListener("mouseleave", (e) => {
  edit.classList.toggle("active");
});

const completion_display = document.getElementById("line");
const completion = document.getElementById("profile_completion");
function profileCompletionStatus_main() {
  const a = profileCompletionStatus();
  if (a === 100) {
    completion.style.display = "none";
  }
  completion_display.style.width = a + "%";
  const completion_percent = document.getElementById("completion-percent");
  completion_percent.textContent = `${a}%`;
}
profileCompletionStatus_main();