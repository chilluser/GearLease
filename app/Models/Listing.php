<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Listing extends Model
{
    use HasFactory;
    protected $fillable = ['title','description','category','price_per_day','image_url','seller_id'];

    protected $primaryKey = 'listing_id';

    public function seller()
    {
        return $this->belongsTo(User::class, 'seller_id');
    }
}