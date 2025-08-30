import { SEED_TEMPLATES } from "../lib/seed-data"

async function seedTemplates() {
  console.log("Starting template seeding...")

  // This would typically use a service account or admin SDK
  // For demo purposes, we'll just log the templates that would be created

  try {
    console.log(`Found ${SEED_TEMPLATES.length} seed templates:`)

    SEED_TEMPLATES.forEach((template, index) => {
      console.log(`${index + 1}. ${template.title} (${template.category})`)
      console.log(`   Subject: ${template.subject}`)
      console.log(`   Tags: ${template.tags?.join(", ") || "None"}`)
      console.log("")
    })

    console.log("Seed templates ready for import!")
    console.log("Use the Import feature in the app to add these templates.")
  } catch (error) {
    console.error("Error seeding templates:", error)
  }
}

// Run the seeding function
seedTemplates()
