// Scan rendered card backs with macOS Vision, independently of the generator.
// Usage: swift scripts/check-print-card-qr.swift EXPECTED_URL IMAGE_DIRECTORY
import Foundation
import Vision

guard CommandLine.arguments.count == 3 else {
    fputs("Usage: check-print-card-qr.swift EXPECTED_URL IMAGE_DIRECTORY\n", stderr)
    exit(2)
}
let expected = CommandLine.arguments[1]
let directory = URL(fileURLWithPath: CommandLine.arguments[2], isDirectory: true)
let files = try FileManager.default.contentsOfDirectory(at: directory, includingPropertiesForKeys: nil)
    .filter { $0.lastPathComponent.contains("-back") && ["jpg", "png"].contains($0.pathExtension.lowercased()) }
    .sorted { $0.lastPathComponent < $1.lastPathComponent }
var results: [[String: Any]] = []
for file in files {
    let request = VNDetectBarcodesRequest()
    request.symbologies = [.qr]
    try VNImageRequestHandler(url: file, options: [:]).perform([request])
    let decoded = request.results?.compactMap { $0.payloadStringValue } ?? []
    results.append(["file": file.lastPathComponent, "decoded": decoded, "pass": decoded == [expected]])
}
let passed = !results.isEmpty && results.allSatisfy { $0["pass"] as? Bool == true }
let report: [String: Any] = ["expectedUrl": expected, "checked": results.count, "passed": passed, "results": results]
let output = try JSONSerialization.data(withJSONObject: report, options: [.prettyPrinted, .sortedKeys])
print(String(decoding: output, as: UTF8.self))
exit(passed ? 0 : 1)
