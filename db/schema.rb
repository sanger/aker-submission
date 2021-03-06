# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2018_10_03_164129) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "citext"
  enable_extension "plpgsql"

  create_table "contact_groups", id: :serial, force: :cascade do |t|
    t.citext "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_contact_groups_on_name", unique: true
  end

  create_table "contacts", id: :serial, force: :cascade do |t|
    t.citext "fullname", null: false
    t.citext "email", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_contacts_on_email", unique: true
  end

  create_table "label_templates", id: :serial, force: :cascade do |t|
    t.string "name", null: false
    t.string "template_type"
    t.integer "external_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_label_templates_on_name", unique: true
  end

  create_table "labware_types", id: :serial, force: :cascade do |t|
    t.integer "num_of_cols"
    t.integer "num_of_rows"
    t.boolean "col_is_alpha"
    t.boolean "row_is_alpha"
    t.citext "name", null: false
    t.string "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "uses_decapper", default: false, null: false
    t.index ["name"], name: "index_labware_types_on_name", unique: true
  end

  create_table "labwares", id: :serial, force: :cascade do |t|
    t.integer "manifest_id", null: false
    t.integer "labware_index", null: false
    t.integer "print_count", default: 0, null: false
    t.json "contents"
    t.string "barcode"
    t.string "container_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "supplier_plate_name"
    t.index ["barcode"], name: "index_labwares_on_barcode", unique: true
    t.index ["container_id"], name: "index_labwares_on_container_id", unique: true
    t.index ["manifest_id", "labware_index"], name: "index_labwares_on_manifest_id_and_labware_index", unique: true
  end

  create_table "manifests", id: :serial, force: :cascade do |t|
    t.integer "no_of_labwares_required"
    t.boolean "supply_labwares"
    t.integer "labware_type_id"
    t.string "status"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.text "address"
    t.integer "contact_id"
    t.uuid "set_id"
    t.string "manifest_uuid"
    t.citext "owner_email"
    t.boolean "supply_decappers", default: false, null: false
    t.datetime "dispatch_date"
    t.index ["contact_id"], name: "index_manifests_on_contact_id"
    t.index ["dispatch_date"], name: "index_manifests_on_dispatch_date"
    t.index ["labware_type_id"], name: "index_manifests_on_labware_type_id"
    t.index ["owner_email"], name: "index_manifests_on_owner_email"
  end

  create_table "material_receptions", id: :serial, force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "labware_id", null: false
    t.index ["labware_id"], name: "index_material_receptions_on_labware_id", unique: true
  end

  create_table "printers", id: :serial, force: :cascade do |t|
    t.citext "name", null: false
    t.string "label_type"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_printers_on_name", unique: true
  end

  add_foreign_key "labwares", "manifests", on_delete: :cascade
  add_foreign_key "manifests", "contacts"
  add_foreign_key "manifests", "labware_types"
  add_foreign_key "material_receptions", "labwares"
end
