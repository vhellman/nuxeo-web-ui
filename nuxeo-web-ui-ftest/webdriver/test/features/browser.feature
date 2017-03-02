Feature: Browser

  I can browse the repository

  Background:
    Given user "John" exists in group "members"
    And I login as "John"

  Scenario: Browse
    When I click the "browser" button
    Then I can see the browser tree
    And I can see the "Domain" browser tree node
    When I click "Domain" in the browser tree
    Then I can see the "Workspaces" browser tree node
    When I click "Workspaces" in the browser tree
    Then I can see the "Workspaces" document
