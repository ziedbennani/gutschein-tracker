import React from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"; // Adjust import based on your UI library
import { Input } from "@/components/ui/input"; // Adjust import based on your UI library
import { Button } from "@/components/ui/button"; // Adjust import based on your UI library

interface GutscheinFormProps {
  onClose: () => void;
  defaultGutscheinNummer?: string;
  defaultBetrag?: number;
}

const GutscheinForm: React.FC<GutscheinFormProps> = ({
  onClose,
  defaultGutscheinNummer,
  defaultBetrag,
}) => {
  return (
    <Dialog>
      <DialogContent>
        <DialogTitle>Gutschein Details</DialogTitle>
        <form>
          <div>
            <label>Gutschein Nummer</label>
            <Input
              placeholder="Gutschein Nummer"
              defaultValue={defaultGutscheinNummer}
            />
          </div>
          <div>
            <label>Betrag</label>
            <Input
              placeholder="Betrag"
              type="number"
              defaultValue={defaultBetrag?.toString()} // Convert number to string for input
            />
          </div>
          <Button type="submit">Submit</Button>
          <Button type="button" onClick={onClose}>
            Cancel
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default GutscheinForm;
