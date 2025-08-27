"use client"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Phone, Mail } from "lucide-react"
import type { NotificationContact } from "@/types"

interface NotificationContactsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contacts: NotificationContact[]
  onSave: (contacts: NotificationContact[]) => void
}

export function NotificationContactsDialog({ open, onOpenChange, contacts, onSave }: NotificationContactsDialogProps) {
  const [localContacts, setLocalContacts] = useState<NotificationContact[]>(contacts)

  const addContact = () => {
    const newContact: NotificationContact = {
      id: Date.now().toString(),
      name: "",
      email: "",
      phone: "",
      relationship: "",
    }
    setLocalContacts([...localContacts, newContact])
  }

  const updateContact = (id: string, field: keyof NotificationContact, value: string) => {
    setLocalContacts((prev) => prev.map((contact) => (contact.id === id ? { ...contact, [field]: value } : contact)))
  }

  const removeContact = (id: string) => {
    setLocalContacts((prev) => prev.filter((contact) => contact.id !== id))
  }

  const handleSave = () => {
    const validContacts = localContacts.filter(
      (contact) => contact.name.trim() && (contact.email?.trim() || contact.phone?.trim()),
    )
    onSave(validContacts)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Notification Contacts</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {localContacts.map((contact) => (
            <div key={contact.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Contact {localContacts.indexOf(contact) + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => removeContact(contact.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Name"
                  value={contact.name}
                  onChange={(e) => updateContact(contact.id, "name", e.target.value)}
                />
                <Input
                  placeholder="Relationship (Wife, Mother, etc.)"
                  value={contact.relationship}
                  onChange={(e) => updateContact(contact.id, "relationship", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Email address"
                    type="email"
                    className="pl-10"
                    value={contact.email}
                    onChange={(e) => updateContact(contact.id, "email", e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="WhatsApp number"
                    type="tel"
                    className="pl-10"
                    value={contact.phone}
                    onChange={(e) => updateContact(contact.id, "phone", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button variant="outline" onClick={addContact} className="w-full bg-transparent">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Contacts</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
