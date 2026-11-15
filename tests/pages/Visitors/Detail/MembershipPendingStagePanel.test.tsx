// Libs
import { screen } from "@testing-library/react";
// Local
import { MembershipPendingStagePanel } from "../../../../src/pages/Visitors/Detail/components/MembershipPendingStagePanel";
import { renderScreen } from "../../../support/render";

const person = {
  id: "p1",
  name: "Vitor Lopes Gomes",
  phone: null,
  age: null,
  email: null,
  status: "membership_pending" as const,
  whatsapp_opened_at: null,
  class_invite_sent_at: null,
  signup_window_from: null,
  membership_interest_sent_at: null,
  entry_type: null,
  coffee_retry_used: false,
  origin: "integration" as const,
  membership_status: null,
  visited_on: null,
  created_at: "2026-09-06T00:00:00Z",
  updated_at: "2026-09-06T00:00:00Z",
};

describe("membership pending stage panel", () => {
  it("credits the four classes to whoever came through the integration", () => {
    renderScreen(<MembershipPendingStagePanel person={person} />);

    expect(screen.getByText("Concluiu as 4 aulas")).toBeInTheDocument();
  });

  it("credits the form to whoever signed up directly", () => {
    renderScreen(
      <MembershipPendingStagePanel
        person={{ ...person, origin: "membership_signup" as const }}
      />,
    );

    expect(
      screen.getByText("Preencheu a Ficha de Interesse de Membresia"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Concluiu as 4 aulas")).not.toBeInTheDocument();
  });
});
