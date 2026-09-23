<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
        'group',
    ];

    /**
     * Retrieve a setting by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = static::where('key', $key)->first();

        return $setting ? $setting->value : $default;
    }

    /**
     * Set or update a setting.
     */
    public static function set(string $key, mixed $value, string $group = 'general'): self
    {
        return static::updateOrCreate(
            ['key' => $key],
            ['value' => $value, 'group' => $group]
        );
    }

    /**
     * Check if self-registration is turned off.
     */
    public static function isRegistrationOff(): bool
    {
        if ((bool) config('auth.is_register_off', false)) {
            return true;
        }

        $allow = static::get('allow_registration');
        if ($allow !== null) {
            return in_array(strtolower((string) $allow), ['0', 'false', 'off', 'no'], true);
        }

        return false;
    }
}
