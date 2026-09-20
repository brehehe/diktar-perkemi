<?php

use App\Services\QrCodeService;

test('it selects a QR version that fits the complete byte payload', function () {
    expect(QrCodeService::generateMatrix(str_repeat('A', 17)))->toHaveCount(21)
        ->and(QrCodeService::generateMatrix(str_repeat('A', 18)))->toHaveCount(25)
        ->and(QrCodeService::generateMatrix(str_repeat('A', 134)))->toHaveCount(41);
});

test('it produces a complete square matrix and quiet zone for an attendance URL', function () {
    $url = 'https://starkids.mediatamakreatif.id/event/penataran-cbt-terpadu-september-2026/scan?code=SEPS01';
    $matrix = QrCodeService::generateMatrix($url);
    $svg = QrCodeService::svg($url, 320);

    expect($matrix)->not->toBeEmpty()
        ->and(collect($matrix)->every(fn (array $row): bool => count($row) === count($matrix)))->toBeTrue()
        ->and(collect($matrix)->flatten()->every(fn (int $module): bool => in_array($module, [0, 1], true)))->toBeTrue()
        ->and($svg)->toContain('viewBox="0 0 '.(count($matrix) + 8).' '.(count($matrix) + 8).'"')
        ->and($svg)->toContain('shape-rendering="crispEdges"');
});

test('it rejects a payload that cannot fit instead of printing a corrupt QR code', function () {
    QrCodeService::generateMatrix(str_repeat('A', 135));
})->throws(InvalidArgumentException::class, 'Teks QR terlalu panjang');

test('it keeps the level L mask zero format information in both copies', function () {
    $matrix = QrCodeService::generateMatrix('PERKEMI');
    $size = count($matrix);
    $formatBits = array_map('intval', str_split('111011111000100'));

    $firstCopy = [
        ...array_slice($matrix[8], 0, 6),
        $matrix[8][7],
        $matrix[8][8],
        $matrix[7][8],
        $matrix[5][8],
        $matrix[4][8],
        $matrix[3][8],
        $matrix[2][8],
        $matrix[1][8],
        $matrix[0][8],
    ];
    $secondCopy = [
        ...array_map(fn (int $index): int => $matrix[$size - 1 - $index][8], range(0, 6)),
        ...array_map(fn (int $index): int => $matrix[8][$size - 15 + $index], range(7, 14)),
    ];

    expect($firstCopy)->toBe($formatBits)
        ->and($secondCopy)->toBe($formatBits);
});
