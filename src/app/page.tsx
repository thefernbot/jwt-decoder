"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Key,
  FileJson,
  Lock,
  Clock,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Trash2,
  Github,
} from "lucide-react";

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  isExpired: boolean;
  expiresAt: Date | null;
  issuedAt: Date | null;
}

const EXAMPLE_TOKENS = [
  {
    name: "Standard Token",
    description: "Basic JWT with common claims",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.POstGetfAytaZS82wHcjoTyoqhMyxXiWdR7Nn7A29DNSl0EiXLdwJ6xC6AfgZWF1bOsS_TuYI3OG85AmiExREkrS6tDfTQ2B3WXlrr-wp5AokiRbz3_oB4OxG-W9KcEEbDRcZc0nH3L7LzYptiy1PtAylQGxHTWZXtGz4ht0bAecBgmpdgXMguEIcoqPJ1n3pIWk_dUZegpqx0Lka21H6XxUTxiy8OcaarA8zdnPUnV6AmNP3ecFawIFYdvJB_cm-GvpCSbr8G8y_Mllj8f4x9nBH8pQux89_6gUY618iYv7tuPWBFfEbLxtF2pZS6YC1aSfLQxeNe8djT9YjpvRZA",
  },
  {
    name: "Expired Token",
    description: "Token with past expiration",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzEyMyIsImVtYWlsIjoiam9obkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAwMDAwMDAwLCJleHAiOjE3MDAwMDM2MDB9.XK9_8w8k7j7xY7k5mN8FGvH3sJ5kP3nT9pR7wL2qZ4M",
  },
  {
    name: "RS256 Token",
    description: "Token using RSA algorithm",
    token:
      "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im15LWtleS1pZCJ9.eyJpc3MiOiJodHRwczovL2F1dGguZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyXzQ1NiIsImF1ZCI6ImFwaS5leGFtcGxlLmNvbSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoxODAwMDAwMDAwLCJzY29wZSI6InJlYWQgd3JpdGUifQ.SIGNATURE_PLACEHOLDER",
  },
];

const KNOWN_CLAIMS: Record<string, { label: string; description: string }> = {
  iss: { label: "Issuer", description: "Principal that issued the JWT" },
  sub: { label: "Subject", description: "Principal that is the subject of the JWT" },
  aud: { label: "Audience", description: "Recipients that the JWT is intended for" },
  exp: { label: "Expiration Time", description: "Time after which the JWT expires" },
  nbf: { label: "Not Before", description: "Time before which the JWT must not be accepted" },
  iat: { label: "Issued At", description: "Time at which the JWT was issued" },
  jti: { label: "JWT ID", description: "Unique identifier for the JWT" },
  name: { label: "Name", description: "Full name of the subject" },
  email: { label: "Email", description: "Email address of the subject" },
  role: { label: "Role", description: "Role or permission level" },
  scope: { label: "Scope", description: "Scopes or permissions granted" },
  admin: { label: "Admin", description: "Administrative privilege flag" },
};

function base64UrlDecode(str: string): string {
  // Replace URL-safe characters with standard base64
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Pad with = to make it valid base64
  while (base64.length % 4) {
    base64 += "=";
  }
  try {
    return atob(base64);
  } catch {
    throw new Error("Invalid base64 encoding");
  }
}

function decodeJWT(token: string): DecodedJWT | null {
  const parts = token.trim().split(".");
  if (parts.length !== 3) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));
    const signature = parts[2];

    let isExpired = false;
    let expiresAt: Date | null = null;
    let issuedAt: Date | null = null;

    if (payload.exp) {
      expiresAt = new Date(payload.exp * 1000);
      isExpired = expiresAt < new Date();
    }

    if (payload.iat) {
      issuedAt = new Date(payload.iat * 1000);
    }

    return { header, payload, signature, isExpired, expiresAt, issuedAt };
  } catch {
    return null;
  }
}

function formatJSON(obj: Record<string, unknown>): string {
  return JSON.stringify(obj, null, 2);
}

function ClaimRow({
  name,
  value,
}: {
  name: string;
  value: unknown;
}) {
  const known = KNOWN_CLAIMS[name];
  const isTimestamp =
    typeof value === "number" && (name === "exp" || name === "iat" || name === "nbf");
  const displayValue = isTimestamp
    ? new Date((value as number) * 1000).toLocaleString()
    : JSON.stringify(value);

  return (
    <div className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <code className="text-sm font-mono text-primary">{name}</code>
          {known && (
            <span className="text-xs text-muted-foreground">({known.label})</span>
          )}
        </div>
        {known && (
          <p className="text-xs text-muted-foreground mt-0.5">{known.description}</p>
        )}
      </div>
      <div className="text-sm font-mono text-foreground/80 text-right max-w-[50%] break-all">
        {displayValue}
      </div>
    </div>
  );
}

export default function JWTDecoder() {
  const [token, setToken] = useState("");
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!token.trim()) {
      setDecoded(null);
      setError(null);
      return;
    }

    const result = decodeJWT(token);
    if (result) {
      setDecoded(result);
      setError(null);
    } else {
      setDecoded(null);
      setError("Invalid JWT format. Tokens should have 3 parts separated by dots.");
    }
  }, [token]);

  const copyToClipboard = async (text: string, section: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const loadExample = (exampleToken: string) => {
    setToken(exampleToken);
  };

  const clearToken = () => {
    setToken("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Key className="w-8 h-8" />
              JWT Decoder
            </h1>
            <a
              href="https://github.com/thefernbot/jwt-decoder"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
          <p className="text-muted-foreground">
            Paste a JSON Web Token to decode and inspect its contents
          </p>
        </div>

        {/* Input Section */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Encoded Token</CardTitle>
              <div className="flex items-center gap-2">
                {token && (
                  <Button variant="ghost" size="sm" onClick={clearToken}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your JWT here..."
              className="font-mono text-sm min-h-[120px] resize-y"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            {error && (
              <div className="flex items-center gap-2 mt-3 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Example Tokens */}
        {!token && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Example Tokens</CardTitle>
              <CardDescription>Click to load an example JWT</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {EXAMPLE_TOKENS.map((example) => (
                  <Button
                    key={example.name}
                    variant="outline"
                    className="justify-start h-auto py-3"
                    onClick={() => loadExample(example.token)}
                  >
                    <div className="text-left">
                      <div className="font-medium">{example.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {example.description}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Decoded Output */}
        {decoded && (
          <div className="space-y-4">
            {/* Status Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <Badge variant={decoded.isExpired ? "destructive" : "default"}>
                {decoded.isExpired ? (
                  <>
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Expired
                  </>
                ) : decoded.expiresAt ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Valid
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3 mr-1" />
                    No Expiration
                  </>
                )}
              </Badge>
              <Badge variant="secondary">
                Algorithm: {(decoded.header.alg as string) || "Unknown"}
              </Badge>
              {decoded.header.typ ? (
                <Badge variant="secondary">
                  Type: {String(decoded.header.typ)}
                </Badge>
              ) : null}
              {decoded.expiresAt && (
                <span className="text-sm text-muted-foreground">
                  {decoded.isExpired ? "Expired" : "Expires"}:{" "}
                  {decoded.expiresAt.toLocaleString()}
                </span>
              )}
            </div>

            {/* Tabs for Different Views */}
            <Tabs defaultValue="claims" className="w-full">
              <TabsList>
                <TabsTrigger value="claims">Claims</TabsTrigger>
                <TabsTrigger value="raw">Raw JSON</TabsTrigger>
              </TabsList>

              <TabsContent value="claims" className="space-y-4">
                {/* Header */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileJson className="w-4 h-4" />
                        Header
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(formatJSON(decoded.header), "header")
                        }
                      >
                        {copiedSection === "header" ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {copiedSection === "header" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(decoded.header).map(([key, value]) => (
                      <ClaimRow key={key} name={key} value={value} />
                    ))}
                  </CardContent>
                </Card>

                {/* Payload */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileJson className="w-4 h-4" />
                        Payload
                        <Badge variant="outline" className="ml-2">
                          {Object.keys(decoded.payload).length} claims
                        </Badge>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(formatJSON(decoded.payload), "payload")
                        }
                      >
                        {copiedSection === "payload" ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {copiedSection === "payload" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {Object.entries(decoded.payload).map(([key, value]) => (
                      <ClaimRow key={key} name={key} value={value} />
                    ))}
                  </CardContent>
                </Card>

                {/* Signature */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Signature
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(decoded.signature, "signature")
                        }
                      >
                        {copiedSection === "signature" ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {copiedSection === "signature" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <code className="text-xs font-mono break-all text-muted-foreground">
                        {decoded.signature}
                      </code>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Signature verification requires the secret key or public key
                      (not performed client-side)
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                {/* Header JSON */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Header (JSON)</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(formatJSON(decoded.header), "header-raw")
                        }
                      >
                        {copiedSection === "header-raw" ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {copiedSection === "header-raw" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm font-mono">
                        {formatJSON(decoded.header)}
                      </code>
                    </pre>
                  </CardContent>
                </Card>

                {/* Payload JSON */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Payload (JSON)</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(formatJSON(decoded.payload), "payload-raw")
                        }
                      >
                        {copiedSection === "payload-raw" ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <Copy className="w-4 h-4 mr-1" />
                        )}
                        {copiedSection === "payload-raw" ? "Copied" : "Copy"}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-muted/50 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm font-mono">
                        {formatJSON(decoded.payload)}
                      </code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p>JWT decoding happens entirely in your browser. No tokens are sent to any server.</p>
        </div>
      </div>
    </div>
  );
}
