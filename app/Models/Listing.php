<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Listing extends Model
{
    use HasFactory;
    protected $fillable = ['title','description','category','price_per_day','image_url','seller_id', 'rented','renter_id','rented_at','rented_days'];

    protected $casts = [
    'rented' => 'boolean',
    'rented_at' => 'datetime',
    ];

    protected $primaryKey = 'listing_id';

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
    public function renter()
    {
        return $this->belongsTo(User::class, 'renter_id');
    }
    public function scopeAvailable($query)
    {
        return $query->where('rented', false);
    }
}