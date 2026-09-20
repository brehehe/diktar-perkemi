<?php

namespace App\Services;

use InvalidArgumentException;

/**
 * Pure PHP QR Code Generator (SVG).
 * Implements ISO/IEC 18004 QR Code Model 2 (Versions 1 to 6, Byte Mode, Level L).
 * Requires ZERO external libraries.
 */
class QrCodeService
{
    private static array $exp = [];

    private static array $log = [];

    private static bool $tablesInitialized = false;

    /**
     * QR Code Model 2, error correction level L.
     *
     * @var array<int, array{size: int, dataCodewords: int, ecCodewordsPerBlock: int, blocks: int, align: array<int, int>}>
     */
    private static array $versionInfo = [
        1 => ['size' => 21, 'dataCodewords' => 19, 'ecCodewordsPerBlock' => 7, 'blocks' => 1, 'align' => []],
        2 => ['size' => 25, 'dataCodewords' => 34, 'ecCodewordsPerBlock' => 10, 'blocks' => 1, 'align' => [6, 18]],
        3 => ['size' => 29, 'dataCodewords' => 55, 'ecCodewordsPerBlock' => 15, 'blocks' => 1, 'align' => [6, 22]],
        4 => ['size' => 33, 'dataCodewords' => 80, 'ecCodewordsPerBlock' => 20, 'blocks' => 1, 'align' => [6, 26]],
        5 => ['size' => 37, 'dataCodewords' => 108, 'ecCodewordsPerBlock' => 26, 'blocks' => 1, 'align' => [6, 30]],
        6 => ['size' => 41, 'dataCodewords' => 136, 'ecCodewordsPerBlock' => 18, 'blocks' => 2, 'align' => [6, 34]],
    ];

    private static function initTables(): void
    {
        if (self::$tablesInitialized) {
            return;
        }
        self::$exp = array_fill(0, 512, 0);
        self::$log = array_fill(0, 256, 0);
        $val = 1;
        for ($i = 0; $i < 255; $i++) {
            self::$exp[$i] = $val;
            self::$exp[$i + 255] = $val;
            self::$log[$val] = $i;
            $val = ($val << 1) ^ (($val & 0x80) ? 0x11D : 0);
        }
        self::$tablesInitialized = true;
    }

    private static function gfMul(int $x, int $y): int
    {
        if ($x === 0 || $y === 0) {
            return 0;
        }

        return self::$exp[self::$log[$x] + self::$log[$y]];
    }

    private static function rsPoly(int $ecLen): array
    {
        $poly = [1];
        for ($i = 0; $i < $ecLen; $i++) {
            $next = array_fill(0, count($poly) + 1, 0);
            $factor = self::$exp[$i];
            for ($j = 0; $j < count($poly); $j++) {
                $next[$j] ^= $poly[$j];
                $next[$j + 1] ^= self::gfMul($poly[$j], $factor);
            }
            $poly = $next;
        }

        return $poly;
    }

    private static function rsEncode(array $data, int $ecLen): array
    {
        $poly = self::rsPoly($ecLen);
        $res = array_fill(0, $ecLen, 0);
        foreach ($data as $byte) {
            $factor = $byte ^ $res[0];
            array_shift($res);
            $res[] = 0;
            if ($factor !== 0) {
                for ($j = 0; $j < $ecLen; $j++) {
                    $res[$j] ^= self::gfMul($poly[$j + 1], $factor);
                }
            }
        }

        return $res;
    }

    /**
     * Generate QR Code module matrix (2D array of bools).
     */
    public static function generateMatrix(string $text): array
    {
        self::initTables();
        $len = strlen($text);

        $version = null;
        foreach (self::$versionInfo as $ver => $info) {
            $requiredBits = 4 + 8 + ($len * 8);
            if ($requiredBits <= $info['dataCodewords'] * 8) {
                $version = $ver;
                break;
            }
        }

        if ($version === null) {
            throw new InvalidArgumentException('Teks QR terlalu panjang. Maksimal 134 byte untuk generator QR ini.');
        }

        $vInfo = self::$versionInfo[$version];
        $matrixSize = $vInfo['size'];
        $numDataBytes = $vInfo['dataCodewords'];

        // Bit stream: Mode 4 (Byte Mode) -> 0100 (4 bits), Length (8 bits for v1-9), data (8 bits each)
        $bits = '';
        $bits .= '0100'; // Byte mode
        $bits .= str_pad(decbin($len), 8, '0', STR_PAD_LEFT);
        for ($i = 0; $i < $len; $i++) {
            $bits .= str_pad(decbin(ord($text[$i])), 8, '0', STR_PAD_LEFT);
        }

        // Terminator (up to 4 zeroes)
        $capacityBits = $numDataBytes * 8;
        $bits .= str_repeat('0', min(4, max(0, $capacityBits - strlen($bits))));

        // Pad to byte boundary
        while (strlen($bits) % 8 !== 0) {
            $bits .= '0';
        }

        // Pad with 11101100 (0xEC) and 00010001 (0x11)
        $padBytes = ['11101100', '00010001'];
        $padIndex = 0;
        while (strlen($bits) < $capacityBits) {
            $bits .= $padBytes[$padIndex % 2];
            $padIndex++;
        }

        // Convert bits to data codewords
        $dataCodewords = [];
        for ($i = 0; $i < strlen($bits); $i += 8) {
            $dataCodewords[] = bindec(substr($bits, $i, 8));
        }

        $finalCodewords = self::interleaveWithErrorCorrection(
            $dataCodewords,
            $vInfo['blocks'],
            $vInfo['ecCodewordsPerBlock'],
        );

        // Initialize empty matrix (-1 for unset)
        $matrix = array_fill(0, $matrixSize, array_fill(0, $matrixSize, -1));

        // 1. Finder patterns (7x7 at 3 corners)
        self::placeFinder($matrix, 0, 0);
        self::placeFinder($matrix, $matrixSize - 7, 0);
        self::placeFinder($matrix, 0, $matrixSize - 7);

        // Separators around finders
        for ($i = 0; $i < 8; $i++) {
            self::setIfEmpty($matrix, 7, $i, 0);
            self::setIfEmpty($matrix, $i, 7, 0);
            self::setIfEmpty($matrix, $matrixSize - 8, $i, 0);
            self::setIfEmpty($matrix, $matrixSize - 1 - $i, 7, 0);
            self::setIfEmpty($matrix, 7, $matrixSize - 1 - $i, 0);
            self::setIfEmpty($matrix, $i, $matrixSize - 8, 0);
        }

        // 2. Alignment patterns (for v2+)
        if (! empty($vInfo['align'])) {
            $coords = $vInfo['align'];
            foreach ($coords as $r) {
                foreach ($coords as $c) {
                    // Don't overlap with finders
                    if (($r < 9 && $c < 9) || ($r < 9 && $c >= $matrixSize - 8) || ($r >= $matrixSize - 8 && $c < 9)) {
                        continue;
                    }
                    self::placeAlignment($matrix, $r, $c);
                }
            }
        }

        // 3. Timing patterns
        for ($i = 8; $i < $matrixSize - 8; $i++) {
            self::setIfEmpty($matrix, 6, $i, ($i % 2 === 0) ? 1 : 0);
            self::setIfEmpty($matrix, $i, 6, ($i % 2 === 0) ? 1 : 0);
        }

        // 4. Dark module
        $matrix[4 * $version + 9][8] = 1;

        // 5. Reserve format info areas
        for ($i = 0; $i < 9; $i++) {
            if ($matrix[8][$i] === -1) {
                $matrix[8][$i] = 0;
            }
            if ($matrix[$i][8] === -1) {
                $matrix[$i][8] = 0;
            }
        }
        for ($i = 0; $i < 8; $i++) {
            if ($matrix[8][$matrixSize - 1 - $i] === -1) {
                $matrix[8][$matrixSize - 1 - $i] = 0;
            }
            if ($matrix[$matrixSize - 1 - $i][8] === -1) {
                $matrix[$matrixSize - 1 - $i][8] = 0;
            }
        }

        // 6. Data placement (zigzag from right to left)
        $dataBits = '';
        foreach ($finalCodewords as $cw) {
            $dataBits .= str_pad(decbin($cw), 8, '0', STR_PAD_LEFT);
        }
        $bitIdx = 0;
        $totalBits = strlen($dataBits);

        $row = $matrixSize - 1;
        $col = $matrixSize - 1;
        $dir = -1; // moving upwards

        while ($col > 0) {
            if ($col === 6) {
                $col--; // Skip vertical timing column
            }
            for ($c = 0; $c < 2; $c++) {
                $currCol = $col - $c;
                if ($matrix[$row][$currCol] === -1) {
                    $bit = ($bitIdx < $totalBits) ? (int) $dataBits[$bitIdx] : 0;
                    $bitIdx++;
                    // Apply standard mask pattern 0: (row + col) % 2 == 0
                    $mask = (($row + $currCol) % 2 === 0) ? 1 : 0;
                    $matrix[$row][$currCol] = $bit ^ $mask;
                }
            }
            $row += $dir;
            if ($row < 0 || $row >= $matrixSize) {
                $dir = -$dir;
                $row += $dir;
                $col -= 2;
            }
        }

        // 7. Format Information (Level L, Mask 0: 15 bits: 111011111000100)
        // Keep the bits in the same most-significant-bit-first order used by QR decoders.
        $formatBits = '111011111000100';
        // Place on top-left and split corners
        for ($i = 0; $i < 6; $i++) {
            $matrix[8][$i] = (int) $formatBits[$i];
        }
        $matrix[8][7] = (int) $formatBits[6];
        $matrix[8][8] = (int) $formatBits[7];
        $matrix[7][8] = (int) $formatBits[8];
        for ($i = 9; $i < 15; $i++) {
            $matrix[14 - $i][8] = (int) $formatBits[$i];
        }

        // Second copy
        for ($i = 0; $i < 7; $i++) {
            $matrix[$matrixSize - 1 - $i][8] = (int) $formatBits[$i];
        }
        for ($i = 7; $i < 15; $i++) {
            $matrix[8][$matrixSize - 15 + $i] = (int) $formatBits[$i];
        }

        return $matrix;
    }

    /**
     * Split data across QR blocks, calculate Reed-Solomon bytes per block, then
     * interleave both sections in the order required by ISO/IEC 18004.
     *
     * @param  array<int, int>  $dataCodewords
     * @return array<int, int>
     */
    private static function interleaveWithErrorCorrection(
        array $dataCodewords,
        int $blockCount,
        int $ecCodewordsPerBlock,
    ): array {
        $shortBlockLength = intdiv(count($dataCodewords), $blockCount);
        $longBlockCount = count($dataCodewords) % $blockCount;
        $blocks = [];
        $errorCorrectionBlocks = [];
        $offset = 0;

        for ($blockIndex = 0; $blockIndex < $blockCount; $blockIndex++) {
            $blockLength = $shortBlockLength + ($blockIndex >= $blockCount - $longBlockCount ? 1 : 0);
            $block = array_slice($dataCodewords, $offset, $blockLength);
            $blocks[] = $block;
            $errorCorrectionBlocks[] = self::rsEncode($block, $ecCodewordsPerBlock);
            $offset += $blockLength;
        }

        $interleaved = [];
        $maxDataBlockLength = max(array_map('count', $blocks));
        for ($codewordIndex = 0; $codewordIndex < $maxDataBlockLength; $codewordIndex++) {
            foreach ($blocks as $block) {
                if (array_key_exists($codewordIndex, $block)) {
                    $interleaved[] = $block[$codewordIndex];
                }
            }
        }

        for ($codewordIndex = 0; $codewordIndex < $ecCodewordsPerBlock; $codewordIndex++) {
            foreach ($errorCorrectionBlocks as $block) {
                $interleaved[] = $block[$codewordIndex];
            }
        }

        return $interleaved;
    }

    private static function placeFinder(array &$matrix, int $top, int $left): void
    {
        for ($r = 0; $r < 7; $r++) {
            for ($c = 0; $c < 7; $c++) {
                if ($r === 0 || $r === 6 || $c === 0 || $c === 6 || ($r >= 2 && $r <= 4 && $c >= 2 && $c <= 4)) {
                    $matrix[$top + $r][$left + $c] = 1;
                } else {
                    $matrix[$top + $r][$left + $c] = 0;
                }
            }
        }
    }

    private static function placeAlignment(array &$matrix, int $centerR, int $centerC): void
    {
        for ($r = -2; $r <= 2; $r++) {
            for ($c = -2; $c <= 2; $c++) {
                if (abs($r) === 2 || abs($c) === 2 || ($r === 0 && $c === 0)) {
                    $matrix[$centerR + $r][$centerC + $c] = 1;
                } else {
                    $matrix[$centerR + $r][$centerC + $c] = 0;
                }
            }
        }
    }

    private static function setIfEmpty(array &$matrix, int $r, int $c, int $val): void
    {
        if (isset($matrix[$r][$c]) && $matrix[$r][$c] === -1) {
            $matrix[$r][$c] = $val;
        }
    }

    /**
     * Generate SVG markup for the given text.
     */
    public static function svg(
        string $text,
        int $size = 280,
        string $darkColor = '#0E2747',
        string $lightColor = '#FFFFFF',
        int $quietZone = 4
    ): string {
        $matrix = self::generateMatrix($text);
        $count = count($matrix);
        $totalSize = $count + ($quietZone * 2);

        $rects = '';
        for ($r = 0; $r < $count; $r++) {
            for ($c = 0; $c < $count; $c++) {
                if ($matrix[$r][$c] === 1) {
                    $x = $c + $quietZone;
                    $y = $r + $quietZone;
                    $rects .= "<rect x=\"{$x}\" y=\"{$y}\" width=\"1\" height=\"1\" fill=\"{$darkColor}\"/>";
                }
            }
        }

        return <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {$totalSize} {$totalSize}" width="{$size}" height="{$size}" shape-rendering="crispEdges">
    <rect width="{$totalSize}" height="{$totalSize}" fill="{$lightColor}"/>
    {$rects}
</svg>
SVG;
    }

    /**
     * Generate SVG data URI (data:image/svg+xml;utf8,...) for img src.
     */
    public static function dataUri(string $text, int $size = 280): string
    {
        $svg = self::svg($text, $size);

        return 'data:image/svg+xml;utf8,'.rawurlencode($svg);
    }
}
